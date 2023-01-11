<script setup lang="ts">
import {
  getScheduleList,
  deleteSchedule,
  changeScheduleStatus,
  Schedule
} from "@/api/schedule";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import { ref, onMounted } from "vue";
import { useDetail } from "./hooks";
import Search from "@iconify-icons/ep/search";
import AddFill from "@iconify-icons/ri/add-circle-line";
import EditPen from "@iconify-icons/ri/pencil-line";
import Delete from "@iconify-icons/ri/delete-bin-line";

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
              <div m="4">
                <p m="t-0 b-2">
                  备注: {{ props.row.periodic_task.description }}
                </p>
                <p m="t-0 b-2">告警级别: {{ props.row.notify_config.level }}</p>
                <p m="t-0 b-2">
                  告警内容: {{ props.row.notify_config.content }}
                </p>
                <p m="t-0 b-2">逻辑表达式: {{ props.row.logical_exp }}</p>
                <h3>Family</h3>
                <el-table :data="props.row.check_item">
                  <el-table-column label="Label" prop="label" />
                  <el-table-column label="Type" prop="type" />
                  <el-table-column label="Exec" prop="exec_sql" />
                  <el-table-column label="Condition" prop="condition" />
                  <el-table-column label="Value" prop="value" />
                  <el-table-column label="Return" prop="ret_type" />
                  <el-table-column label="Exec_DB" prop="exec_db_id" />
                  <el-table-column label="DBName" prop="db_name" />
                </el-table>
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
          <el-table-column label="操作" width="180px">
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
