<script setup lang="ts">
import { getDBInfo } from "@/api/database";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { ref, onMounted, nextTick } from "vue";
import Search from "@iconify-icons/ep/search";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Edit from "@iconify-icons/ri/pencil-line";
import Delete from "@iconify-icons/ri/delete-bin-line";

defineOptions({
  name: "Database"
});

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
  type: "",
  nickname: "",
  host: "",
  port: "",
  username: "",
  password: "",
  db_name: "",
  system: ""
};

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

const dbInfo = ref([]);
const dataLoading = ref(true);

const getDBListData = async () => {
  try {
    const data = await getDBInfo({
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

const formDialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });

const handleDeleteItem = dbinfo => {
  ElMessageBox.confirm(
    dbinfo
      ? `确认删除后${dbinfo.nickname}的所有数据源信息将被清空, 且无法恢复`
      : "",
    "提示",
    {
      type: "warning"
    }
  )
    .then(() => {
      message("删除成功", { type: "success" });
    })
    .catch(() => {});
};

/*
const handleManageProduct = product => {
  formDialogVisible.value = true;
  nextTick(() => {
    formData.value = { ...product, status: product?.isSetup ? "1" : "0" };
  });
};*/
</script>

<template>
  <div class="main">
    <div class="w-full flex justify-between mb-4">
      <el-button
        :icon="useRenderIcon(AddFill)"
        @click="formDialogVisible = true"
      >
        新建数据源
      </el-button>
      <el-input
        style="width: 300px"
        v-model="searchValue"
        placeholder="请输入数据源名称或IP地址"
        @keyup.enter="getDBListData"
        @submit.prevent
        clearable
        @clear="getDBListData"
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
          <el-table-column width="50" label="ID" prop="id" />
          <el-table-column label="数据源类型" prop="type" />
          <el-table-column label="数据源别名" prop="nickname" />
          <el-table-column label="数据库主机" prop="host" />
          <el-table-column label="端口" prop="port" />
          <el-table-column label="数据库名" prop="db_name" />
          <!--el-table-column label="状态" prop="mg_state">
            <template v-slot="scope">
              <el-switch
                v-model="scope.row.mg_state"
                @change="userStateChanged(scope.row)"
              />
            </template>
          </el-table-column-->
          <el-table-column label="操作" width="180px">
            <template v-slot="scope">
              <!-- 修改按钮 -->
              <el-button
                type="primary"
                :icon="useRenderIcon(Edit)"
                v-model="scope.row.id"
              />
              <!-- 删除按钮 -->
              <el-button
                type="danger"
                :icon="useRenderIcon(Delete)"
                @click="handleDeleteItem"
              />
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
