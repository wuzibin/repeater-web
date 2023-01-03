<script setup lang="ts">
import { getSysList, deleteSysInfo } from "@/api/system";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import { ref, onMounted } from "vue";
import { useDetail } from "./hooks";
import Search from "@iconify-icons/ep/search";
import AddFill from "@iconify-icons/ri/add-circle-line";
import EditPen from "@iconify-icons/ri/pencil-line";
import Delete from "@iconify-icons/ri/delete-bin-line";

defineOptions({
  name: "System"
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
  getSysListData();
};
const onCurrentChange = (current: number) => {
  pagination.value.current = current;
  getSysListData();
};

const sysInfo = ref([]);
const dataLoading = ref(true);

const getSysListData = async () => {
  try {
    const data = await getSysList({
      p: pagination.value.current,
      size: pagination.value.size,
      search: searchValue.value
    });
    console.log("获取业务系统信息----", data);
    sysInfo.value = data.data;
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
  getSysListData();
});

const handleDelete = async (id: number | string) => {
  const OpSys = sysInfo.value[sysInfo.value.findIndex(sys => sys.id === id)];
  if (OpSys) {
    try {
      const data = await deleteSysInfo(id);
      message(`系统【${OpSys.fullname}】删除成功`, { type: "success" });
      console.log("删除业务系统信息----", data);
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
      getSysListData();
    }
  }
};
</script>

<template>
  <div class="main">
    <div class="w-full flex justify-between mb-4">
      <el-button :icon="useRenderIcon(AddFill)" @click="toAdd()">
        新建数据源
      </el-button>
      <el-input
        style="width: 300px"
        v-model="searchValue"
        placeholder="请输入业务系统名称或IP地址"
        @keyup.enter="getSysListData"
        @submit.prevent
        clearable
        @clear="getSysListData"
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
      <el-empty description="暂无数据" v-show="sysInfo.length === 0" />
      <template v-if="pagination.total > 0">
        <el-table
          :data="sysInfo"
          border
          stripe
          :header-cell-style="{ 'text-align': 'center' }"
          :cell-style="{ 'text-align': 'center' }"
        >
          <el-table-column width="60" label="序号" type="index">
            <template v-slot="scope">
              {{
                (pagination.current - 1) * pagination.size + scope.$index + 1
              }}
            </template>
          </el-table-column>
          <el-table-column label="系统缩写" prop="name" />
          <el-table-column label="系统名称" prop="fullname" />
          <el-table-column label="告警IP" prop="ip" />
          <el-table-column label="备注" prop="remark" />
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
                @confirm="handleDelete(scope.row.id)"
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
