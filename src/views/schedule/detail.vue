<script setup lang="ts">
import { useDetail } from "./hooks";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { message } from "@/utils/message";
// import { getSysInfo } from "@/api/system";
import { getSchedule, updateSchedule, getDict } from "@/api/schedule";
import { ref, computed, onMounted } from "vue";

defineOptions({
  name: "ScheduleDetail"
});

const { initToDetail, id } = useDetail();
initToDetail();

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

const INITIAL_DATA = {
  id: null,
  periodic_task: {
    crontab: {
      month_of_year: "",
      day_of_month: "",
      day_of_week: "",
      hour: "",
      minute: ""
    },
    interval: {
      period: "",
      every: null
    },
    clocked: {
      clocked_time: ""
    },
    strategy: "",
    name: "",
    description: "",
    one_off: false,
    start_time: "",
    enabled: false,
    last_run_at: "",
    date_changed: "",
    total_run_count: null
  },
  notify_config: {
    interval: null,
    count: null,
    rest: null,
    type: "",
    level: "",
    title: "",
    content: "",
    handle: "",
    alert_user: []
  },
  check_item: [],
  logical_exp: "",
  mode: "",
  system_id: null,
  system_name: "",
  loading: false // 前端展示行加载状态使用
};

const scheduleData = ref({ ...INITIAL_DATA });
// const dbInfo = ref([]);
// 数据库类型
const dbtype = ref({});
// 时间间隔选项
const period = ref({});
// 定时策略选项
const cron = ref({});
// 检查类型
const check_type = ref({});
// 比对条件
const condition = ref({});
// 通知方式
const notify_type = ref({});
// 数据返回类型
const ret_type = ref({});
// 告警级别
const level = ref({});
const dataLoading = ref(true);

const getDictData = async () => {
  try {
    const data = await getDict({
      dict: [
        "dbtype",
        "period",
        "cron",
        "check_type",
        "condition",
        "notify_type",
        "ret_type",
        "level"
      ]
    });
    console.log("获取数据字典----", data);
    dbtype.value = data.data.dbtype;
    period.value = data.data.period;
    cron.value = data.data.cron;
    check_type.value = data.data.check_type;
    condition.value = data.data.condition;
    notify_type.value = data.data.notify_type;
    ret_type.value = data.data.ret_type;
    level.value = data.data.level;
  } catch (e) {
    console.log(e);
  } finally {
    setTimeout(() => {
      dataLoading.value = false;
    }, 500);
  }
};

const getScheduleDetailData = async (
  id: number | string | string[] | number[]
) => {
  try {
    const data = await getSchedule(String(id));
    console.log("获取任务信息----", data);
    scheduleData.value = data.data;
  } catch (e) {
    console.log(e);
  } finally {
    setTimeout(() => {
      dataLoading.value = false;
    }, 500);
  }
};

const multiTags = computed(() => {
  return useMultiTagsStoreHook()?.multiTags;
});
const { router } = useDetail();

const closeTab = () => {
  // 跳转至最后一个标签页
  useMultiTagsStoreHook().handleTags("splice", `/schedule/detail/:id`);
  router.push({
    path: multiTags.value[(multiTags as any).value.length - 1].path
  });
};

const updateScheduleDetail = async (
  id: number | string | string[] | number[]
) => {
  try {
    const data = await updateSchedule(String(id), scheduleData.value);
    console.log("更新任务信息----", data);
    scheduleData.value = data.data;
    message(data.msg, { type: "success", showClose: true, duration: 3000 });
    // 关闭标签页
    closeTab();
  } catch (e) {
    console.log(e);
    e.response?.data?.msg
      ? message("提交失败：" + e.response.data.msg, {
          type: "error",
          showClose: true,
          duration: 3000
        })
      : message("提交失败：" + String(e), {
          type: "error",
          showClose: true,
          duration: 3000
        });
  } finally {
    setTimeout(() => {
      dataLoading.value = false;
    }, 500);
  }
};

onMounted(() => {
  getDictData();
  getScheduleDetailData(id);
});
</script>

<template>
  <div class="main">
    <div style="margin-bottom: 20px">
      <h1 align="center">
        {{ scheduleData.periodic_task.name }} - 业务系统详情
      </h1>
    </div>

    <div
      v-loading="dataLoading"
      :element-loading-svg="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-empty description="暂无数据" v-show="scheduleData.id === null" />
      <template v-if="scheduleData.id > 0">
        <el-form
          :model="scheduleData"
          ref="scheduleDataForm"
          label-width="auto"
          class="bg-bg_color w-[99/100] pl-8 pt-4"
          style="padding-bottom: 30px"
        >
          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="periodic_task.name" label="任务名称">
                <el-input v-model="scheduleData.periodic_task.name" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="periodic_task.enabled" label="任务状态">
                <el-switch v-model="scheduleData.periodic_task.enabled" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="periodic_task.description" label="任务描述">
                <el-input
                  :autosize="{ minRows: 5 }"
                  type="textarea"
                  v-model="scheduleData.periodic_task.description"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <!--el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="remark" label="备注">
                <el-input text v-model="sysData.remark" />
              </el-form-item>
            </el-col>
          </el-row-->

          <el-form-item style="margin-left: 100px; margin-top: 20px">
            <el-button type="primary" @click="updateScheduleDetail(id)"
              >提交</el-button
            >
            <el-button @click="closeTab()">取消</el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>
