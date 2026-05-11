<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { ElMessage, ElMessageBox } from 'element-plus';
import { calendarApi } from '../../api/api/calendar-api';
import type { CalendarEventDto } from '../../api/api/calendar-api';
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
  EventInput,
  DatesSetArg,
} from '@fullcalendar/core';

// ─── State ───
const calendarRef = ref<InstanceType<typeof FullCalendar>>();
const events = ref<EventInput[]>([]);
const loading = ref(false);
const authorized = ref(false);
const authChecking = ref(true);

// Dialog
const dialogVisible = ref(false);
const isEdit = ref(false);
const formData = ref<CalendarEventDto>({
  summary: '',
  description: '',
  location: '',
  startDateTime: '',
  endDateTime: '',
  allDay: false,
  attendees: [],
});
const editingEventId = ref<string | null>(null);

// ─── Calendar Options ───
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,today,next',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  },
  locale: 'zh-tw',
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  height: 'auto',
  eventDisplay: 'block',
  events: [] as EventInput[],
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  datesSet: handleDatesSet,
});

// ─── OAuth2 Auth ───
async function checkAuth() {
  authChecking.value = true;
  try {
    const { data } = await calendarApi.getAuthStatus();
    authorized.value = data.authorized;
  } catch {
    authorized.value = false;
  } finally {
    authChecking.value = false;
  }
}

async function startAuth() {
  try {
    const { data } = await calendarApi.getAuthUrl();
    window.open(data.authUrl, '_blank', 'width=600,height=700');
  } catch (err: any) {
    ElMessage.error('取得授權 URL 失敗');
  }
}

// 監聽 OAuth callback 的 postMessage
function handleAuthMessage(event: MessageEvent) {
  if (event.data?.type === 'GOOGLE_CALENDAR_AUTH_SUCCESS') {
    authorized.value = true;
    ElMessage.success('Google Calendar 授權成功！');
    // 觸發載入
    const calApi = calendarRef.value?.getApi();
    if (calApi) {
      const view = calApi.view;
      fetchEvents(view.activeStart.toISOString(), view.activeEnd.toISOString());
    }
  }
}

onMounted(() => {
  checkAuth();
  window.addEventListener('message', handleAuthMessage);
});

onUnmounted(() => {
  window.removeEventListener('message', handleAuthMessage);
});

// ─── Fetch Events ───
async function fetchEvents(startStr: string, endStr: string) {
  if (!authorized.value) return;
  loading.value = true;
  try {
    const { data } = await calendarApi.getEvents(startStr, endStr);
    events.value = data.map((e: CalendarEventDto) => ({
      id: e.id,
      title: e.summary || '(無標題)',
      start: e.startDateTime,
      end: e.endDateTime,
      allDay: e.allDay,
      extendedProps: {
        description: e.description,
        location: e.location,
        colorId: e.colorId,
        attendees: e.attendees || [],
      },
    }));
    calendarOptions.value.events = events.value;
  } catch (err: any) {
    if (err?.response?.status === 401) {
      authorized.value = false;
    } else {
      ElMessage.error('載入事件失敗：' + (err.message || '未知錯誤'));
    }
  } finally {
    loading.value = false;
  }
}

function handleDatesSet(info: DatesSetArg) {
  fetchEvents(info.startStr, info.endStr);
}

// ─── Select Date → Create ───
function handleDateSelect(selectInfo: DateSelectArg) {
  isEdit.value = false;
  editingEventId.value = null;
  formData.value = {
    summary: '',
    description: '',
    location: '',
    startDateTime: selectInfo.startStr,
    endDateTime: selectInfo.endStr,
    allDay: selectInfo.allDay,
    attendees: [],
  };
  dialogVisible.value = true;
  selectInfo.view.calendar.unselect();
}

// ─── Click Event → Edit / Delete ───
function handleEventClick(clickInfo: EventClickArg) {
  isEdit.value = true;
  editingEventId.value = clickInfo.event.id;
  formData.value = {
    summary: clickInfo.event.title,
    description: clickInfo.event.extendedProps.description || '',
    location: clickInfo.event.extendedProps.location || '',
    startDateTime: clickInfo.event.startStr,
    endDateTime: clickInfo.event.endStr || clickInfo.event.startStr,
    allDay: clickInfo.event.allDay,
    attendees: clickInfo.event.extendedProps.attendees || [],
  };
  dialogVisible.value = true;
}

// ─── Drag & Drop ───
async function handleEventDrop(dropInfo: EventDropArg) {
  const ev = dropInfo.event;
  try {
    await calendarApi.updateEvent(ev.id, {
      summary: ev.title,
      description: ev.extendedProps.description || '',
      location: ev.extendedProps.location || '',
      startDateTime: ev.startStr,
      endDateTime: ev.endStr || ev.startStr,
      allDay: ev.allDay,
      attendees: ev.extendedProps.attendees || [],
    });
    ElMessage.success('事件已移動');
  } catch {
    dropInfo.revert();
    ElMessage.error('移動失敗');
  }
}

async function handleEventResize(resizeInfo: any) {
  const ev = resizeInfo.event;
  try {
    await calendarApi.updateEvent(ev.id, {
      summary: ev.title,
      description: ev.extendedProps.description || '',
      location: ev.extendedProps.location || '',
      startDateTime: ev.startStr,
      endDateTime: ev.endStr || ev.startStr,
      allDay: ev.allDay,
      attendees: ev.extendedProps.attendees || [],
    });
    ElMessage.success('事件時間已更新');
  } catch {
    resizeInfo.revert();
    ElMessage.error('更新失敗');
  }
}

// ─── Submit Form ───
async function handleSubmit() {
  if (!formData.value.summary.trim()) {
    ElMessage.warning('請輸入事件標題');
    return;
  }
  try {
    if (isEdit.value && editingEventId.value) {
      await calendarApi.updateEvent(editingEventId.value, formData.value);
      ElMessage.success('事件已更新');
    } else {
      await calendarApi.createEvent(formData.value);
      ElMessage.success('事件已建立');
    }
    dialogVisible.value = false;
    const calApi = calendarRef.value?.getApi();
    if (calApi) {
      const view = calApi.view;
      fetchEvents(view.activeStart.toISOString(), view.activeEnd.toISOString());
    }
  } catch (err: any) {
    ElMessage.error('操作失敗：' + (err.message || '未知錯誤'));
  }
}

// ─── Delete ───
async function handleDelete() {
  if (!editingEventId.value) return;
  try {
    await ElMessageBox.confirm('確定要刪除此事件嗎？', '刪除確認', {
      confirmButtonText: '刪除',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await calendarApi.deleteEvent(editingEventId.value);
    ElMessage.success('事件已刪除');
    dialogVisible.value = false;
    const calApi = calendarRef.value?.getApi();
    if (calApi) {
      const view = calApi.view;
      fetchEvents(view.activeStart.toISOString(), view.activeEnd.toISOString());
    }
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage.error('刪除失敗');
    }
  }
}
</script>

<template>
  <div class="calendar-page">
    <!-- Header -->
    <div class="calendar-header">
      <div class="header-content">
        <div class="header-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div>
          <h1>Google 日曆</h1>
          <p class="subtitle">串接 Google Calendar API — PoC</p>
        </div>
      </div>
      <div class="header-right">
        <div v-if="authorized" class="auth-badge connected">
          <span class="badge-dot" />已連結
        </div>
        <div v-else-if="!authChecking" class="auth-badge disconnected">
          <span class="badge-dot" />未授權
        </div>
        <div v-if="loading" class="loading-indicator">
          <div class="spinner" /><span>載入中...</span>
        </div>
      </div>
    </div>

    <!-- Auth Card (shown when not authorized) -->
    <div v-if="!authorized && !authChecking" class="auth-card">
      <div class="auth-card-inner">
        <div class="auth-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#667eea" stroke-width="1.5"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="#667eea" opacity="0.15"/>
            <path d="M8 12l2 2 4-4" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>連結 Google Calendar</h2>
        <p>點擊下方按鈕登入你的 Google 帳號，授權後即可在此管理行事曆事件。</p>
        <button class="auth-button" @click="startAuth">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          使用 Google 帳號授權
        </button>
      </div>
    </div>

    <!-- Loading Auth Check -->
    <div v-if="authChecking" class="auth-checking">
      <div class="spinner large" />
      <p>檢查授權狀態...</p>
    </div>

    <!-- Calendar (shown when authorized) -->
    <div v-if="authorized" class="calendar-wrapper">
      <FullCalendar ref="calendarRef" :options="calendarOptions" />
    </div>

    <!-- Event Dialog -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '編輯事件' : '新增事件'"
      width="480px" class="event-dialog" destroy-on-close>
      <el-form label-position="top" :model="formData">
        <el-form-item label="事件標題" required>
          <el-input v-model="formData.summary" placeholder="輸入事件標題"
            clearable size="large" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="formData.description" type="textarea"
            :rows="3" placeholder="事件描述（選填）" />
        </el-form-item>
        <el-form-item label="地點">
          <el-input v-model="formData.location" placeholder="地點（選填）" clearable />
        </el-form-item>
        <el-form-item label="參與者">
          <el-select
            v-model="formData.attendees"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="輸入 Email 後按 Enter 新增"
            style="width: 100%"
          />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="開始時間" class="flex-1">
            <el-input v-model="formData.startDateTime" placeholder="ISO-8601" />
          </el-form-item>
          <el-form-item label="結束時間" class="flex-1">
            <el-input v-model="formData.endDateTime" placeholder="ISO-8601" />
          </el-form-item>
        </div>
        <el-form-item label="全天事件">
          <el-switch v-model="formData.allDay" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="isEdit" type="danger" plain @click="handleDelete">刪除</el-button>
          <div class="footer-right">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">
              {{ isEdit ? '更新' : '建立' }}
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.calendar-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', 'Noto Sans TC', sans-serif;
}

/* ─── Header ─── */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 20px 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-content { display: flex; align-items: center; gap: 16px; }
.header-right { display: flex; align-items: center; gap: 16px; }

.header-icon {
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.2); border-radius: 12px;
  backdrop-filter: blur(4px);
}

.calendar-header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
.subtitle { margin: 2px 0 0; font-size: 13px; opacity: 0.85; }

.auth-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px;
  font-size: 13px; font-weight: 500;
}
.auth-badge.connected { background: rgba(52,211,153,0.25); }
.auth-badge.disconnected { background: rgba(251,191,36,0.25); }
.badge-dot {
  width: 8px; height: 8px; border-radius: 50%;
}
.connected .badge-dot { background: #34d399; box-shadow: 0 0 6px #34d399; }
.disconnected .badge-dot { background: #fbbf24; box-shadow: 0 0 6px #fbbf24; }

.loading-indicator { display: flex; align-items: center; gap: 8px; font-size: 13px; opacity: 0.9; }
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
.spinner.large { width: 32px; height: 32px; border-width: 3px; border-color: rgba(102,126,234,0.2); border-top-color: #667eea; }

@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Auth Card ─── */
.auth-card {
  display: flex; justify-content: center; padding: 60px 0;
}
.auth-card-inner {
  text-align: center;
  background: #fff;
  border-radius: 20px;
  padding: 48px 56px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f5;
  max-width: 420px;
}
.auth-icon { margin-bottom: 20px; }
.auth-card-inner h2 {
  margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #1a1a2e;
}
.auth-card-inner p {
  margin: 0 0 28px; color: #6b7280; font-size: 14px; line-height: 1.6;
}
.auth-button {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 14px 32px; border: none; border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(102,126,234,0.35);
}
.auth-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102,126,234,0.45);
}
.auth-button:active { transform: translateY(0); }

.auth-checking {
  display: flex; flex-direction: column; align-items: center;
  padding: 80px 0; gap: 16px; color: #6b7280;
}

/* ─── Calendar Wrapper ─── */
.calendar-wrapper {
  background: #fff; border-radius: 16px; padding: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #f0f0f5;
}

/* ─── FullCalendar Overrides ─── */
:deep(.fc) {
  --fc-border-color: #e8e8ef;
  --fc-button-bg-color: #667eea;
  --fc-button-border-color: #667eea;
  --fc-button-hover-bg-color: #5a6fd6;
  --fc-button-hover-border-color: #5a6fd6;
  --fc-button-active-bg-color: #4e60c2;
  --fc-button-active-border-color: #4e60c2;
  --fc-today-bg-color: rgba(102,126,234,0.06);
  --fc-event-bg-color: #667eea;
  --fc-event-border-color: #5a6fd6;
  --fc-highlight-color: rgba(102,126,234,0.12);
  --fc-page-bg-color: transparent;
  font-family: 'Inter', 'Noto Sans TC', sans-serif;
}
:deep(.fc .fc-toolbar-title) { font-size: 1.3em; font-weight: 700; color: #1a1a2e; }
:deep(.fc .fc-button) {
  border-radius: 8px !important; font-weight: 500; font-size: 13px;
  padding: 6px 14px; transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(102,126,234,0.2);
}
:deep(.fc .fc-button:focus) { box-shadow: 0 0 0 3px rgba(102,126,234,0.3) !important; }
:deep(.fc .fc-button-group > .fc-button) { border-radius: 0 !important; }
:deep(.fc .fc-button-group > .fc-button:first-child) { border-radius: 8px 0 0 8px !important; }
:deep(.fc .fc-button-group > .fc-button:last-child) { border-radius: 0 8px 8px 0 !important; }
:deep(.fc .fc-daygrid-day-number) { font-weight: 500; color: #4a4a6a; padding: 8px; }
:deep(.fc .fc-event) {
  border-radius: 6px; padding: 2px 6px; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: transform 0.15s ease, box-shadow 0.15s ease;
}
:deep(.fc .fc-event:hover) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
:deep(.fc .fc-col-header-cell-cushion) {
  font-weight: 600; color: #667eea; text-transform: uppercase;
  font-size: 12px; letter-spacing: 0.5px; padding: 10px 4px;
}
:deep(.fc .fc-daygrid-day.fc-day-today) { background: var(--fc-today-bg-color); }
:deep(.fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  background: #667eea; color: #fff; border-radius: 50%;
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
}
:deep(.fc .fc-timegrid-slot) { height: 48px; }
:deep(.fc .fc-scrollgrid) { border-radius: 12px; overflow: hidden; }

/* ─── Dialog ─── */
.form-row { display: flex; gap: 12px; }
.flex-1 { flex: 1; }
.dialog-footer { display: flex; justify-content: space-between; align-items: center; }
.footer-right { display: flex; gap: 8px; }
:deep(.event-dialog .el-dialog__header) { border-bottom: 1px solid #f0f0f5; padding-bottom: 16px; }
:deep(.event-dialog .el-dialog__body) { padding-top: 20px; }
:deep(.event-dialog .el-dialog) { border-radius: 16px; overflow: hidden; }
</style>
