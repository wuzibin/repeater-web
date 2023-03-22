<script setup lang="ts">
import { deleteDBInfo, getDBList } from "@/api/database";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import { ref, onMounted } from "vue";
import { useDetail } from "./hooks";
import Search from "@iconify-icons/ep/search";
import AddFill from "@iconify-icons/ri/add-circle-line";
import EditPen from "@iconify-icons/ri/pencil-line";
import Delete from "@iconify-icons/ri/delete-bin-line";

defineOptions({
  name: "Database"
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
  getDBListData();
};
const onCurrentChange = (current: number) => {
  pagination.value.current = current;
  getDBListData();
};

const searchDBListData = async () => {
  pagination.value.current = 1;
  getDBListData();
};

const dbInfo = ref([]);
const dataLoading = ref(true);

const getDBListData = async () => {
  try {
    const data = await getDBList({
      p: pagination.value.current,
      size: pagination.value.size,
      search: searchValue.value
    });
    console.log("获取数据库信息----", data);
    dbInfo.value = data.data;
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
  getDBListData();
});

const handleDelete = async (id: number | string) => {
  const OpDb = dbInfo.value[dbInfo.value.findIndex(db => db.id === id)];
  if (OpDb) {
    try {
      const data = await deleteDBInfo(id);
      message(`数据源【${OpDb.nickname}】删除成功`, { type: "success" });
      console.log("删除数据库信息----", data);
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
      getDBListData();
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
        placeholder="请输入数据源名称或IP地址"
        @keyup.enter="searchDBListData"
        @submit.prevent
        clearable
        @clear="searchDBListData"
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
      <el-empty description="暂无数据" v-show="dbInfo.length === 0" />
      <template v-if="pagination.total > 0">
        <el-table
          :data="dbInfo"
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
          <el-table-column label="数据源类型" prop="type" />
          <el-table-column label="数据源别名" prop="nickname" />
          <el-table-column label="数据库主机" prop="host" />
          <el-table-column label="端口" prop="port" width="60" />
          <el-table-column label="数据库名" prop="db_name" />
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
          :page-sizes="[10, 20, 50, 100, 200]"
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
