<script setup lang="ts">
import { useDetail } from "./hooks";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { message } from "@/utils/message";
import { getDBList, testRunSQL } from "@/api/database";
import { getSysList } from "@/api/system";
import { getSysUserList } from "@/api/user";
import { getSchedule, updateSchedule, getDict } from "@/api/schedule";
import { ref, computed, onMounted } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import AddIcon from "@iconify-icons/ri/add-line";

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
  system_name: ""
};

interface CheckItem {
  label: string;
  type: string;
  condition: string;
  value: string;
  ret_type: string;
  exec_db_id: number;
  exec_sql: string;
  db_name: string;
  diff_type: string;
  exec_db2_id: number;
  exec_sql2: string;
  db2_name: string;
}

// 任务信息
const scheduleData = ref({ ...INITIAL_DATA });
// crontab类型结构
const CrontabObj = ref({
  month_of_year: "",
  day_of_month: "",
  day_of_week: "",
  hour: "",
  minute: ""
});
// interval类型结构
const IntervalObj = ref({
  period: "",
  every: null
});
// clocked类型
const ClockedObj = ref({
  clocked_time: ""
});
// 通知类型选项
const NTypeObj = ref([]);
// 业务系统信息
const sysInfo = ref([]);
// 用户信息
const userInfo = ref([]);
// 数据库信息
const dbInfo = ref([]);
// SQL临时结果
const tmpSQL = ref([]);
const sqlHeader = ref({});

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
// 比对类型
const diff_type = ref({});
// 告警级别
const level = ref({});
const dataLoading = ref(true);
const displaySQL = ref(false);

const getSysListData = async () => {
  try {
    const data = await getSysList({ size: 1000 });
    console.log("获取业务系统对照关系----", data);
    sysInfo.value = data.data;
  } catch (e) {
    console.log(e);
  }
};

const getSysUserListData = async (id: number) => {
  try {
    const data = await getSysUserList({ system_id: id });
    console.log("获取所属业务系统的用户信息----", data);
    userInfo.value = data.data;
  } catch (e) {
    console.log(e);
  }
};

const getDBListData = async () => {
  try {
    const data = await getDBList({
      size: 1000
    });
    console.log("获取数据库信息----", data);
    dbInfo.value = data.data;
  } catch (e) {
    console.log(e);
  }
};

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
        "diff_type",
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
    diff_type.value = data.data.diff_type;
    level.value = data.data.level;
  } catch (e) {
    console.log(e);
  }
};

const getScheduleDetailData = async (
  id: number | string | string[] | number[]
) => {
  try {
    const data = await getSchedule(String(id));
    console.log("获取任务信息----", data);
    scheduleData.value = data.data;
    const sysuser = await getSysUserList({
      system_id: scheduleData.value.system_id
    });
    console.log("获取所属业务系统的用户信息----", data);
    userInfo.value = sysuser.data;
    NTypeObj.value = scheduleData.value.notify_config.type.split("|");
    switch (scheduleData.value.mode) {
      case "crontab":
        CrontabObj.value = scheduleData.value.periodic_task.crontab;
        break;
      case "interval":
        IntervalObj.value = scheduleData.value.periodic_task.interval;
        break;
      case "clocked":
        ClockedObj.value = scheduleData.value.periodic_task.clocked;
        console.log(ClockedObj.value.clocked_time);
    }
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

const myeval = exp => {
  return new Function("return " + exp)();
};

const expvaild = () => {
  let logical_exp = scheduleData.value.logical_exp;
  if ("" === logical_exp.trim()) return "error";
  logical_exp = logical_exp
    .replace(new RegExp("and", "g"), "&&")
    .replace(new RegExp("or", "g"), "||")
    .replace(new RegExp("not", "g"), "!");
  scheduleData.value.check_item.forEach(element => {
    logical_exp = logical_exp.replace(new RegExp(element.label, "g"), "true");
  });
  console.log(logical_exp);
  try {
    return "" + myeval(logical_exp);
  } catch (e) {
    return e.message;
  }
};

const checkexp = () => {
  const chk_ret = expvaild();
  "true" === chk_ret || "false" === chk_ret
    ? message(`校验成功！若检查项所有条件为真，最终表达式结果为${chk_ret}`, {
        type: "success",
        showClose: true,
        duration: 3000
      })
    : message(`逻辑表达式异常！${chk_ret}`, {
        type: "error",
        showClose: true,
        duration: 3000
      });
};

const updateScheduleDetail = async (
  id: number | string | string[] | number[]
) => {
  const chk_ret = expvaild();
  if ("true" !== chk_ret && "false" !== chk_ret) {
    message("逻辑表达式有误！请改正后再提交！", {
      type: "error",
      showClose: true,
      duration: 5000
    });
    return;
  }

  try {
    scheduleData.value.notify_config.type = NTypeObj.value.join("|");
    switch (scheduleData.value.mode) {
      case "crontab":
        scheduleData.value.periodic_task.crontab = CrontabObj.value;
        break;
      case "interval":
        scheduleData.value.periodic_task.interval = IntervalObj.value;
        break;
      case "clocked":
        scheduleData.value.periodic_task.clocked = ClockedObj.value;
        console.log(ClockedObj.value.clocked_time);
    }
    console.log("提交的数据----", scheduleData.value);
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

const addCheckItem = () => {
  const len = scheduleData.value.check_item.length;

  scheduleData.value.check_item.push({
    label: String.fromCharCode("A".charCodeAt(0) + len),
    type: "",
    condition: "",
    value: "",
    ret_type: "",
    exec_db_id: null,
    exec_sql: "",
    diff_type: "",
    exec_db2_id: null,
    exec_sql2: ""
  });
};

const removeCheckItem = (item: CheckItem) => {
  const index = scheduleData.value.check_item.indexOf(item);
  if (index !== -1) {
    scheduleData.value.check_item.splice(index, 1);
    for (let i = 0; i < scheduleData.value.check_item.length; i++) {
      scheduleData.value.check_item[i].label = String.fromCharCode(
        "A".charCodeAt(0) + i
      );
    }
  }
};

const cronSwitch = () => {
  // 定时策略为指定时间时，必须为一次性任务
  scheduleData.value.periodic_task.one_off =
    scheduleData.value.mode == "clocked";
};

const runSQL = async (
  id: number | string | string[] | number[],
  sql: string
) => {
  try {
    const sqlObj = {
      exec_sql: sql
    };
    console.log("执行的SQL----", sqlObj);
    const data = await testRunSQL(String(id), sqlObj);
    console.log("SQL执行情况----", data);
    sqlHeader.value = data.data.header;
    tmpSQL.value = data.data.result;
    message(data.msg, { type: "success", showClose: true, duration: 3000 });
    displaySQL.value = true;
  } catch (e) {
    console.log(e);
    e.response?.data?.msg
      ? message("执行异常：" + e.response.data.msg, {
          type: "error",
          showClose: true,
          duration: 3000
        })
      : message("执行异常：" + String(e), {
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
  getSysListData();
  getDBListData();
  getScheduleDetailData(id);
});
</script>

<style>
.cronInput {
  margin-top: 10px;
}

.subFormItem {
  margin-top: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: 100%;
  margin-bottom: 15px;
}
</style>

<template>
  <div class="main">
    <div style="margin-bottom: 20px">
      <h1 align="center">
        {{ scheduleData.periodic_task.name }} - 业务系统详情
      </h1>
    </div>

    <el-dialog v-model="displaySQL" title="SQL执行结果">
      <el-table :data="tmpSQL">
        <el-table-column v-for="(item, i) in sqlHeader" :key="i" :label="item">
          <template v-slot="scope">
            {{ scope.row[i] }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <div
      v-loading="dataLoading"
      :element-loading-svg="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
      class="w-full 0m0b-"
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
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item prop="periodic_task.name" label="任务名称">
                <el-input v-model="scheduleData.periodic_task.name" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item prop="periodic_task.enabled" label="任务状态">
                <el-switch v-model="scheduleData.periodic_task.enabled" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="12" :sm="10" :md="8" :lg="6" :xl="4">
              <el-form-item prop="system_id" label="所属业务系统">
                <el-select
                  ref="systemRef"
                  v-model="scheduleData.system_id"
                  placeholder="请选择"
                  @change="getSysUserListData(scheduleData.system_id)"
                >
                  <el-option
                    v-for="item in sysInfo"
                    :key="item.id"
                    :label="item.fullname"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item prop="periodic_task.description" label="任务描述">
                <el-input
                  :autosize="{ minRows: 5 }"
                  type="textarea"
                  v-model="scheduleData.periodic_task.description"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item prop="mode" label="定时策略">
                <el-radio-group
                  v-model="scheduleData.mode"
                  class="ml-4"
                  @change="cronSwitch()"
                >
                  <el-radio
                    v-for="(value, key) in cron"
                    :label="key"
                    :key="key"
                  >
                    {{ value }}
                  </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="scheduleData.mode == 'crontab'">
            <el-col width>
              <el-form-item label="Crontab">
                <el-form
                  :model="CrontabObj"
                  label-width="150px"
                  label-position="left"
                >
                  <el-form-item label="分钟(minute)">
                    <el-input v-model="CrontabObj.minute" class="cronInput" />
                  </el-form-item>
                  <el-form-item label="小时(hour)">
                    <el-input v-model="CrontabObj.hour" class="cronInput" />
                  </el-form-item>
                  <el-form-item label="日(day_of_month)">
                    <el-input
                      v-model="CrontabObj.day_of_month"
                      class="cronInput"
                    />
                  </el-form-item>
                  <el-form-item label="月(month_of_year)">
                    <el-input
                      v-model="CrontabObj.month_of_year"
                      class="cronInput"
                    />
                  </el-form-item>
                  <el-form-item label="周(day_of_week)">
                    <el-input
                      v-model="CrontabObj.day_of_week"
                      class="cronInput"
                    />
                  </el-form-item>
                </el-form>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="scheduleData.mode == 'interval'">
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item label="时间间隔">
                <el-form :model="IntervalObj" :inline="true">
                  <el-form-item prop="IntervalObj">
                    <el-input-number :min="1" v-model="IntervalObj.every" />
                    <el-select
                      class="w-20 m-1"
                      v-model="IntervalObj.period"
                      placeholder="间隔"
                      site
                    >
                      <el-option
                        v-for="(value, key) in period"
                        :label="value"
                        :key="key"
                        :value="key"
                      />
                    </el-select>
                  </el-form-item>
                </el-form>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row v-if="scheduleData.mode == 'clocked'">
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item label="指定时间">
                <el-form :model="ClockedObj" :inline="true">
                  <el-form-item prop="ClockedObj">
                    <el-date-picker
                      v-model="ClockedObj.clocked_time"
                      type="datetime"
                      placeholder="请选择执行时间"
                    />
                  </el-form-item>
                </el-form>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item prop="periodic_task.one_off" label="一次性任务">
                <el-switch v-model="scheduleData.periodic_task.one_off" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item prop="periodic_task.start_time" label="开始时间">
                <el-date-picker
                  v-model="scheduleData.periodic_task.start_time"
                  type="datetime"
                  placeholder="请选择开始时间(可选)"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item prop="check_item" label="检查项">
                <el-button
                  type="success"
                  :icon="useRenderIcon(AddIcon)"
                  circle
                  plain
                  @click="addCheckItem"
                  style="margin-bottom: 15px"
                />
                <el-card
                  class="box-card"
                  :body-style="{ padding: '15px' }"
                  v-for="(item, index) in scheduleData.check_item"
                  :key="item.label"
                  :label="item.label"
                  :prop="'scheduleData.check_item.' + index + '.value'"
                  shadow="hover"
                >
                  <template #header>
                    <div class="card-header">
                      <span
                        ><el-tag>{{ item.label }}</el-tag></span
                      >
                      <el-button
                        type="danger"
                        class="button"
                        text
                        @click="removeCheckItem(item)"
                        >删除</el-button
                      >
                    </div>
                  </template>
                  <div class="text item">
                    <div class="subFormItem">
                      <el-form-item prop="type" label="检查类型">
                        <el-select v-model="item.type" placeholder="请选择">
                          <el-option
                            v-for="(value, key) in check_type"
                            :key="key"
                            :label="value"
                            :value="key"
                          />
                        </el-select>
                      </el-form-item>
                    </div>
                    <!-- 执行SQL -->
                    <div v-if="item.type == 'sql'">
                      <div class="subFormItem">
                        <el-form-item prop="exec_sql" label="执行SQL">
                          <el-input
                            :autosize="{ minRows: 5 }"
                            type="textarea"
                            v-model="item.exec_sql"
                          />
                        </el-form-item>
                      </div>
                      <div class="subFormItem">
                        <el-form-item prop="exec_db" label="执行数据库">
                          <el-select
                            v-model="item.exec_db_id"
                            placeholder="请选择"
                          >
                            <el-option
                              v-for="db in dbInfo"
                              :key="db.id"
                              :label="db.nickname"
                              :value="db.id"
                            />
                          </el-select>
                          <el-button
                            type="primary"
                            style="margin-left: 15px"
                            @click="runSQL(item.exec_db_id, item.exec_sql)"
                            >测试执行</el-button
                          >
                        </el-form-item>
                      </div>
                      <div class="subFormItem">
                        <el-form-item prop="diff_type" label="比对类型">
                          <el-select
                            v-model="item.diff_type"
                            placeholder="请选择"
                          >
                            <el-option
                              v-for="(value, key) in diff_type"
                              :key="key"
                              :label="value"
                              :value="key"
                            />
                          </el-select>
                          <el-alert
                            v-if="item.diff_type == 'count'"
                            :closable="false"
                            title="对比数据库返回的结果数目"
                            type="info"
                            show-icon
                          />
                          <el-alert
                            v-if="item.diff_type == 'value'"
                            :closable="false"
                            title="对比返回首条记录的第一个字段的数值(INT)，如COUNT(*)"
                            type="info"
                            show-icon
                          />
                        </el-form-item>
                      </div>

                      <div class="subFormItem">
                        <el-form-item prop="condition" label="触发条件">
                          <el-form :inline="true">
                            <el-form-item style="margin-right: 0px">
                              <el-select
                                v-model="item.condition"
                                placeholder="条件"
                                style="width: 100px"
                              >
                                <el-option
                                  v-for="(value, key) in condition"
                                  :key="key"
                                  :label="value"
                                  :value="key"
                                />
                              </el-select>
                            </el-form-item>
                            <el-form-item>
                              <el-input
                                style="width: 100px"
                                v-model="item.value"
                                placeholder="阈值"
                              />
                            </el-form-item>
                          </el-form>
                        </el-form-item>
                      </div>

                      <div class="subFormItem">
                        <el-form-item prop="ret_type" label="返回结果类型">
                          <el-select
                            v-model="item.ret_type"
                            placeholder="请选择"
                          >
                            <el-option
                              v-for="(value, key) in ret_type"
                              :key="key"
                              :label="value"
                              :value="key"
                            />
                          </el-select>
                          <el-alert
                            :closable="false"
                            title="仅配置北斗监控的返回结果，邮件默认返回完整SQL结果集"
                            type="info"
                            show-icon
                          />
                        </el-form-item>
                      </div>
                    </div>

                    <!-- 跨库比对 -->
                    <div v-if="item.type == 'diff'">
                      <div class="subFormItem">
                        <el-form-item prop="exec_sql" label="库1执行SQL">
                          <el-input
                            :autosize="{ minRows: 5 }"
                            type="textarea"
                            v-model="item.exec_sql"
                          />
                        </el-form-item>
                      </div>
                      <div class="subFormItem">
                        <el-form-item prop="exec_db" label="执行数据库">
                          <el-select
                            v-model="item.exec_db_id"
                            placeholder="请选择"
                          >
                            <el-option
                              v-for="db in dbInfo"
                              :key="db.id"
                              :label="db.nickname"
                              :value="db.id"
                            />
                          </el-select>
                          <el-button
                            type="primary"
                            style="margin-left: 15px"
                            @click="runSQL(item.exec_db_id, item.exec_sql)"
                            >测试执行</el-button
                          >
                        </el-form-item>
                      </div>
                      <div class="subFormItem">
                        <el-form-item prop="condition" label="触发条件">
                          <el-select
                            v-model="item.condition"
                            placeholder="条件"
                            style="width: 100px"
                          >
                            <el-option
                              v-for="(value, key) in condition"
                              :key="key"
                              :label="value"
                              :value="key"
                            />
                          </el-select>
                        </el-form-item>
                      </div>
                      <div class="subFormItem">
                        <el-form-item prop="exec_sql2" label="库2执行SQL">
                          <el-input
                            :autosize="{ minRows: 5 }"
                            type="textarea"
                            v-model="item.exec_sql2"
                          />
                        </el-form-item>
                      </div>
                      <div class="subFormItem">
                        <el-form-item prop="exec_db2" label="执行数据库2">
                          <el-select
                            v-model="item.exec_db2_id"
                            placeholder="请选择"
                          >
                            <el-option
                              v-for="db in dbInfo"
                              :key="db.id"
                              :label="db.nickname"
                              :value="db.id"
                            />
                          </el-select>
                          <el-button
                            type="primary"
                            style="margin-left: 15px"
                            @click="runSQL(item.exec_db2_id, item.exec_sql2)"
                            >测试执行</el-button
                          >
                        </el-form-item>
                      </div>

                      <div class="subFormItem">
                        <el-form-item prop="diff_type" label="比对类型">
                          <el-select
                            v-model="item.diff_type"
                            placeholder="请选择"
                          >
                            <el-option
                              v-for="(value, key) in diff_type"
                              :key="key"
                              :label="value"
                              :value="key"
                            />
                          </el-select>
                          <el-alert
                            v-if="item.diff_type == 'count'"
                            :closable="false"
                            title="对比两个数据库返回的结果数目"
                            type="success"
                          />
                          <el-alert
                            v-if="item.diff_type == 'value'"
                            :closable="false"
                            title="对比返回的首条记录的第一个字段内容"
                            type="success"
                          />
                        </el-form-item>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="20" :sm="18" :md="16" :lg="14" :xl="10">
              <el-form-item prop="logical_exp" label="告警表达式">
                <el-input v-model="scheduleData.logical_exp" />
              </el-form-item>
            </el-col>
            <el-col :span="2" style="margin-left: 10px">
              <el-button type="warning" plain @click="checkexp()"
                >检查</el-button
              >
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="22" :sm="20" :md="18" :lg="16" :xl="12">
              <el-form-item prop="notify_config" label="告警规则配置">
                <el-form
                  :model="scheduleData.notify_config"
                  style="width: 100%"
                >
                  <div class="subFormItem">
                    <el-form-item prop="level" label="告警级别">
                      <el-radio-group
                        v-model="scheduleData.notify_config.level"
                      >
                        <el-radio-button
                          v-for="(value, key) in level"
                          :label="key"
                          :key="key"
                        >
                          {{ value }}
                        </el-radio-button>
                      </el-radio-group>
                    </el-form-item>
                  </div>
                  <div class="subFormItem">
                    <el-form-item prop="type" label="通知方式">
                      <el-select
                        v-model="NTypeObj"
                        multiple
                        placeholder="请选择"
                      >
                        <el-option
                          v-for="(value, key) in notify_type"
                          :key="key"
                          :label="value"
                          :value="key"
                        />
                      </el-select>
                    </el-form-item>
                  </div>
                  <div class="subFormItem">
                    <el-form-item prop="title" label="告警标题">
                      <el-input
                        v-model="scheduleData.notify_config.title"
                        placeholder="告警标题(北斗关键字)"
                      />
                    </el-form-item>
                  </div>
                  <div class="subFormItem">
                    <el-form-item prop="content" label="告警内容">
                      <el-input
                        v-model="scheduleData.notify_config.content"
                        placeholder="告警正文"
                        :autosize="{ minRows: 5 }"
                        type="textarea"
                      />
                    </el-form-item>
                  </div>
                  <div class="subFormItem">
                    <el-form-item prop="handle" label="处置方法">
                      <el-input
                        v-model="scheduleData.notify_config.handle"
                        placeholder="收到告警后的处理（可选，仅邮件发送）"
                        :autosize="{ minRows: 5 }"
                        type="textarea"
                      />
                    </el-form-item>
                  </div>
                  <div class="subFormItem">
                    <el-form-item prop="alert" label="告警条件">
                      <el-form :inline="true">
                        <el-form-item style="margin-right: 0px">
                          <el-input
                            v-model="scheduleData.notify_config.interval"
                            style="width: 80px"
                          />分钟内计数超过
                        </el-form-item>
                        <el-form-item style="margin-right: 0px">
                          <el-input
                            v-model="scheduleData.notify_config.count"
                            style="width: 80px"
                          />次则告警
                        </el-form-item>
                      </el-form>
                    </el-form-item>
                  </div>
                  <div class="subFormItem">
                    <el-form-item prop="rest" label="告警压缩">
                      <el-form :inline="true">
                        <el-form-item style="margin-right: 0px">
                          <el-input
                            v-model="scheduleData.notify_config.rest"
                            style="width: 80px"
                          />分钟内的告警将被压缩（不压缩填0）
                        </el-form-item>
                      </el-form>
                    </el-form-item>
                  </div>
                  <div class="subFormItem">
                    <el-form-item prop="alert_user" label="告警联系人">
                      <el-select
                        v-model="scheduleData.notify_config.alert_user"
                        multiple
                        filterable
                        placeholder="请选择"
                      >
                        <el-option
                          v-for="user in userInfo"
                          :key="user.id"
                          :label="user.username"
                          :value="user.id"
                        />
                      </el-select>
                    </el-form-item>
                  </div>
                </el-form>
              </el-form-item>
            </el-col>
          </el-row>

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
