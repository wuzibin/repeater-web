<script setup lang="ts">
import {
  getScheduleList,
  deleteSchedule,
  changeScheduleStatus,
  Schedule,
  runSchedule,
  getDict
} from "@/api/schedule";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import { ref, onMounted } from "vue";
import { useDetail } from "./hooks";
import Search from "@iconify-icons/ep/search";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Run from "@iconify-icons/ri/play-line";
import EditPen from "@iconify-icons/ri/pencil-line";
import Delete from "@iconify-icons/ri/delete-bin-line";
import { ElMessageBox } from "element-plus";
import { getDBList } from "@/api/database";

defineOptions({
  name: "Schedule"
});

const { toDetail, toAdd } = useDetail();

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

const pagination = ref({ current: 1, size: 10, total: 0 });
const searchValue = ref("");
const onPageSizeChange = (size: number) => {
  pagination.value.size = size;
  pagination.value.current = 1;
  getScheduleListData();
};
const onCurrentChange = (current: number) => {
  pagination.value.current = current;
  getScheduleListData();
};

const scheduleInfo = ref([]);
const dataLoading = ref(true);

const getScheduleListData = async () => {
  try {
    const data = await getScheduleList({
      p: pagination.value.current,
      size: pagination.value.size,
      search: searchValue.value
    });
    console.log("获取任务信息----", data);
    data.data.map(item => {
      item.loading = false;
      return item;
    });
    scheduleInfo.value = data.data;
    pagination.value = {
      ...pagination.value,
      total: data.total
    };
  } catch (e) {
    console.log(e);
  } finally {
    setTimeout(() => {
      dataLoading.value = false;
    }, 500);
  }
};

onMounted(() => {
  getScheduleListData();
  getDBListData();
  getDictData();
});

const handleDelete = async (row: Schedule) => {
  const OpSchedule = row;
  /*scheduleInfo.value[
      scheduleInfo.value.findIndex(schedule => schedule.id === id)
    ];*/
  if (OpSchedule) {
    try {
      const data = await deleteSchedule(OpSchedule.id);
      message(`任务【${OpSchedule.periodic_task.name}】删除成功`, {
        type: "success"
      });
      console.log("删除任务----", data);
    } catch (e) {
      console.log(e);
      e.response?.data?.msg
        ? message("删除失败：" + e.response.data.msg, {
            type: "error",
            showClose: true,
            duration: 3000
          })
        : message("删除失败：" + String(e), {
            type: "error",
            showClose: true,
            duration: 3000
          });
    } finally {
      getScheduleListData();
    }
  }
};

const RunSchedule = (row: Schedule) => {
  const OpSchedule = row;
  /*scheduleInfo.value[
      scheduleInfo.value.findIndex(schedule => schedule.id === id)
    ];*/
  console.log(OpSchedule);
  if (OpSchedule) {
    ElMessageBox.confirm(
      `确认执行任务【${OpSchedule.periodic_task.name}】`,
      "Warning",
      {
        confirmButtonText: "执行",
        cancelButtonText: "取消",
        type: "warning"
      }
    ).then(async () => {
      try {
        const data = await runSchedule({
          schedule: [OpSchedule.id],
          run: true
        });
        message(
          `任务【${OpSchedule.periodic_task.name}】执行成功，${data.msg}`,
          {
            type: "success"
          }
        );
      } catch (e) {
        console.log(e);
        e.response?.data?.msg
          ? message(
              `任务【${OpSchedule.periodic_task.name}】执行失败：` +
                e.response.data.msg,
              {
                type: "error",
                showClose: true,
                duration: 3000
              }
            )
          : message("执行失败：" + String(e), {
              type: "error",
              showClose: true,
              duration: 3000
            });
      }
    });
  }
};
const ChangeStatus = async (row: Schedule) => {
  const OpSchedule = row;
  /*scheduleInfo.value[
      scheduleInfo.value.findIndex(schedule => schedule.id === id)
    ];*/
  console.log(OpSchedule);
  if (OpSchedule) {
    try {
      OpSchedule.loading = true;
      const data = await changeScheduleStatus({
        schedule: [OpSchedule.id],
        status: OpSchedule.periodic_task.enabled
      });
      message(
        `任务【${OpSchedule.periodic_task.name}】状态已设置为${
          OpSchedule.periodic_task.enabled ? "启用" : "禁用"
        }`,
        { type: "success" }
      );
      console.log("任务状态修改----", data);
    } catch (e) {
      console.log(e);
      e.response?.data?.msg
        ? message(
            `任务【${OpSchedule.periodic_task.name}】状态修改失败：` +
              e.response.data.msg,
            {
              type: "error",
              showClose: true,
              duration: 3000
            }
          )
        : message("删除失败：" + String(e), {
            type: "error",
            showClose: true,
            duration: 3000
          });
    } finally {
      OpSchedule.loading = false;
    }
  }
};

// 检查类型
const check_type = ref({});
// 比对条件
const condition = ref({});
// 数据返回类型
const ret_type = ref({});
// 比对类型
const diff_type = ref({});
// 数据库信息
const dbInfo = ref([]);

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
      dict: ["check_type", "condition", "ret_type", "diff_type"]
    });
    console.log("获取数据字典----", data);

    check_type.value = data.data.check_type;
    condition.value = data.data.condition;
    ret_type.value = data.data.ret_type;
    diff_type.value = data.data.diff_type;
  } catch (e) {
    console.log(e);
  }
};
</script>

<template>
  <div class="main">
    <div class="w-full flex justify-between mb-4">
      <el-button :icon="useRenderIcon(AddFill)" @click="toAdd()">
        新建任务
      </el-button>
      <el-input
        style="width: 300px"
        v-model="searchValue"
        placeholder="请输入任务名称、系统名称或IP地址"
        @keyup.enter="getScheduleListData"
        @submit.prevent
        clearable
        @clear="getScheduleListData"
      >
        <template #suffix>
          <el-icon class="el-input__icon">
            <IconifyIconOffline
              v-show="searchValue.length === 0"
              :icon="Search"
            />
          </el-icon>
        </template>
      </el-input>
    </div>
    <div
      v-loading="dataLoading"
      :element-loading-svg="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-empty description="暂无数据" v-show="scheduleInfo.length === 0" />
      <template v-if="pagination.total > 0">
        <el-table
          :data="scheduleInfo"
          border
          stripe
          :header-cell-style="{ 'text-align': 'center' }"
          :cell-style="{ 'text-align': 'center' }"
        >
          <el-table-column type="expand">
            <template #default="props">
              <div style="padding: 30px">
                <el-descriptions
                  class="margin-top"
                  title="任务详情"
                  :column="2"
                  border
                >
                  <el-descriptions-item :span="2">
                    <template #label>
                      <div class="cell-item">备注</div>
                    </template>
                    {{ props.row.periodic_task.description }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">告警级别</div>
                    </template>
                    <el-tag>{{ props.row.notify_config.level }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">逻辑表达式</div>
                    </template>
                    {{ props.row.logical_exp }}
                  </el-descriptions-item>
                  <el-descriptions-item :span="2">
                    <template #label>
                      <div class="cell-item">检查项</div>
                    </template>
                    <div>
                      <el-row>
                        <el-col
                          :xs="20"
                          :sm="20"
                          :md="11"
                          :lg="11"
                          :xl="7"
                          v-for="(item, index) in props.row.check_item"
                          :key="item.label"
                          :label="item.label"
                          :offset="1"
                          style="margin-bottom: 10px"
                        >
                          <el-card
                            class="box-card"
                            :body-style="{ padding: '15px' }"
                            :prop="'props.row.check_item.' + index + '.value'"
                            shadow="hover"
                          >
                            <template #header>
                              <div class="card-header">
                                <span
                                  ><el-tag>{{ item.label }}</el-tag></span
                                >
                              </div>
                            </template>
                            <div class="text item">
                              <div class="subFormItem">
                                <el-form-item prop="type" label="检查类型">
                                  <el-select
                                    v-model="item.type"
                                    placeholder="请选择"
                                    disabled
                                  >
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
                                      disabled
                                    />
                                  </el-form-item>
                                </div>
                                <div class="subFormItem">
                                  <el-form-item
                                    prop="exec_db"
                                    label="执行数据库"
                                    disabled
                                  >
                                    <el-select
                                      v-model="item.exec_db_id"
                                      placeholder="请选择"
                                      disabled
                                    >
                                      <el-option
                                        v-for="db in dbInfo"
                                        :key="db.id"
                                        :label="db.nickname"
                                        :value="db.id"
                                      />
                                    </el-select>
                                  </el-form-item>
                                </div>

                                <div class="subFormItem">
                                  <el-form-item
                                    prop="ret_type"
                                    label="返回结果类型"
                                  >
                                    <el-select
                                      v-model="item.ret_type"
                                      placeholder="请选择"
                                      disabled
                                    >
                                      <el-option
                                        v-for="(value, key) in ret_type"
                                        :key="key"
                                        :label="value"
                                        :value="key"
                                      />
                                    </el-select>
                                  </el-form-item>
                                </div>
                                <div class="subFormItem">
                                  <el-form-item
                                    prop="condition"
                                    label="触发条件"
                                  >
                                    <el-form :inline="true">
                                      <el-form-item style="margin-right: 0px">
                                        <el-select
                                          v-model="item.condition"
                                          placeholder="条件"
                                          style="width: 100px"
                                          disabled
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
                                          disabled
                                        />
                                      </el-form-item>
                                    </el-form>
                                  </el-form-item>
                                </div>
                              </div>

                              <!-- 跨库比对 -->
                              <div v-if="item.type == 'diff'">
                                <div class="subFormItem">
                                  <el-form-item
                                    prop="exec_sql"
                                    label="库1执行SQL"
                                  >
                                    <el-input
                                      :autosize="{ minRows: 5 }"
                                      type="textarea"
                                      v-model="item.exec_sql"
                                      disabled
                                    />
                                  </el-form-item>
                                </div>
                                <div class="subFormItem">
                                  <el-form-item
                                    prop="exec_db"
                                    label="执行数据库"
                                  >
                                    <el-select
                                      v-model="item.exec_db_id"
                                      placeholder="请选择"
                                      disabled
                                    >
                                      <el-option
                                        v-for="db in dbInfo"
                                        :key="db.id"
                                        :label="db.nickname"
                                        :value="db.id"
                                      />
                                    </el-select>
                                  </el-form-item>
                                </div>

                                <div class="subFormItem">
                                  <el-form-item
                                    prop="exec_sql2"
                                    label="库2执行SQL"
                                  >
                                    <el-input
                                      :autosize="{ minRows: 5 }"
                                      type="textarea"
                                      v-model="item.exec_sql2"
                                      disabled
                                    />
                                  </el-form-item>
                                </div>
                                <div class="subFormItem">
                                  <el-form-item
                                    prop="exec_db2"
                                    label="执行数据库2"
                                  >
                                    <el-select
                                      v-model="item.exec_db2_id"
                                      placeholder="请选择"
                                      disabled
                                    >
                                      <el-option
                                        v-for="db in dbInfo"
                                        :key="db.id"
                                        :label="db.nickname"
                                        :value="db.id"
                                      />
                                    </el-select>
                                  </el-form-item>
                                </div>

                                <div class="subFormItem">
                                  <el-form-item
                                    prop="diff_type"
                                    label="比对类型"
                                  >
                                    <el-select
                                      v-model="item.diff_type"
                                      placeholder="请选择"
                                      disabled
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
                                      v-if="item.diff_type == 'num'"
                                      :closable="false"
                                      title="对比返回的首条记录的第一个字段（数值）"
                                      type="success"
                                    />
                                    <el-alert
                                      v-if="item.diff_type == 'str'"
                                      :closable="false"
                                      title="比对返回的首条记录的第一个字段（字符串）"
                                      type="success"
                                    />
                                  </el-form-item>
                                </div>
                                <div class="subFormItem">
                                  <el-form-item
                                    prop="condition"
                                    label="触发条件"
                                  >
                                    <el-select
                                      v-model="item.condition"
                                      placeholder="条件"
                                      style="width: 100px"
                                      disabled
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
                              </div>
                            </div>
                          </el-card>
                        </el-col>
                      </el-row>
                    </div>
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">告警标题</div>
                    </template>
                    {{ props.row.notify_config.title }}
                  </el-descriptions-item>

                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">告警内容</div>
                    </template>
                    {{ props.row.notify_config.content }}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">告警条件</div>
                    </template>
                    在{{ props.row.notify_config.interval }}分钟内触发超过{{
                      props.row.notify_config.count
                    }}则告警
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="cell-item">告警压缩</div>
                    </template>
                    <div v-if="props.row.notify_config.rest > 0">
                      {{ props.row.notify_config.rest }}分钟内不重复告警
                    </div>
                    <div v-if="props.row.notify_config.rest == 0">不压缩</div>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="60" label="序号" type="index">
            <template v-slot="scope">
              {{
                (pagination.current - 1) * pagination.size + scope.$index + 1
              }}
            </template>
          </el-table-column>
          <el-table-column label="任务名称" prop="periodic_task.name" />
          <el-table-column label="系统名称" prop="system_name" />
          <el-table-column label="任务状态">
            <template v-slot="scope">
              <el-switch
                v-model="scope.row.periodic_task.enabled"
                :loading="scope.row.loading"
                @change="ChangeStatus(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="定时策略" prop="periodic_task.strategy" />
          <el-table-column
            label="上次运行时间"
            prop="periodic_task.last_run_at"
          />
          <el-table-column label="操作" width="80px">
            <template v-slot="scope">
              <!-- 执行按钮 -->
              <el-button
                class="reset-margin"
                link
                type="info"
                :icon="useRenderIcon(Run)"
                @click="RunSchedule(scope.row)"
              >
                执行
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="编辑" width="180px">
            <template v-slot="scope">
              <!-- 修改按钮 -->
              <el-button
                class="reset-margin"
                link
                type="primary"
                :icon="useRenderIcon(EditPen)"
                @click="toDetail(scope.row.id)"
              >
                修改
              </el-button>

              <!-- 删除按钮 -->
              <el-popconfirm
                title="是否确认删除?"
                @confirm="handleDelete(scope.row)"
              >
                <template #reference>
                  <el-button
                    class="reset-margin"
                    link
                    type="danger"
                    :icon="useRenderIcon(Delete)"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 页面区域 -->
        <el-pagination
          style="margin-top: 20px; text-align: center"
          :current-page="pagination.current"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="pagination.size"
          layout="->,total, prev, pager, next, sizes, jumper"
          :total="pagination.total"
          @size-change="onPageSizeChange"
          @current-change="onCurrentChange"
        />
      </template>
    </div>
  </div>
</template>
