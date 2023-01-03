<script setup lang="ts">
import { useDetail } from "./hooks";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { message } from "@/utils/message";
import { getSysInfo, updateSysInfo } from "@/api/system";
import { ref, computed, onMounted } from "vue";

defineOptions({
  name: "SystemDetail"
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
  id: 0,
  name: "",
  fullname: "",
  ip: "",
  remark: ""
};

const sysData = ref({ ...INITIAL_DATA });
const dataLoading = ref(true);

const getSysDetailData = async (id: number | string | string[] | number[]) => {
  try {
    const data = await getSysInfo(String(id));
    console.log("获取业务系统信息----", data);
    sysData.value = data.data;
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
  useMultiTagsStoreHook().handleTags("splice", `/system/detail/:id`);
  router.push({
    path: multiTags.value[(multiTags as any).value.length - 1].path
  });
};

const updateSysDetail = async (id: number | string | string[] | number[]) => {
  try {
    const data = await updateSysInfo(String(id), sysData.value);
    console.log("更新业务系统信息----", data);
    sysData.value = data.data;
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
  getSysDetailData(id);
});
</script>

<template>
  <div class="main">
    <div style="margin-bottom: 20px">
      <h1 align="center">{{ sysData.fullname }} - 业务系统详情</h1>
    </div>

    <div
      v-loading="dataLoading"
      :element-loading-svg="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-empty description="暂无数据" v-show="sysData.id === 0" />
      <template v-if="sysData.id > 0">
        <el-form
          :model="sysData"
          ref="sysDataForm"
          label-width="auto"
          class="bg-bg_color w-[99/100] pl-8 pt-4"
          style="padding-bottom: 30px"
        >
          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="name" label="系统缩写">
                <el-input v-model="sysData.name" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="fullname" label="系统名称">
                <el-input v-model="sysData.fullname" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="ip" label="告警IP">
                <el-input v-model="sysData.ip" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="remark" label="备注">
                <el-input v-model="sysData.remark" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item style="margin-left: 100px; margin-top: 20px">
            <el-button type="primary" @click="updateSysDetail(id)"
              >提交</el-button
            >
            <el-button @click="closeTab()">取消</el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>
