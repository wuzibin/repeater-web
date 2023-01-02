<script setup lang="ts">
import { useDetail } from "./hooks";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { message } from "@/utils/message";
import { getDBInfo, updateDBInfo, checkDBConn } from "@/api/database";
import { getSysInfo } from "@/api/system";
import { getDict } from "@/api/schedule";
import { ref, computed, onMounted } from "vue";

defineOptions({
  name: "DBInfoDetail"
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
  type: "",
  nickname: "",
  host: "",
  port: 0,
  username: "",
  password: "",
  db_name: "",
  system_name: "",
  system: null
};

const dbData = ref({ ...INITIAL_DATA });
const dbType = ref([]);
const sysInfo = ref([]);
const dataLoading = ref(true);
const checking = ref(false);

const getDBDetailData = async (id: number | string | string[] | number[]) => {
  try {
    const data = await getDBInfo(String(id));
    console.log("获取数据库信息----", data);
    dbData.value = data.data;
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
  useMultiTagsStoreHook().handleTags("splice", `/database/detail/:id`);
  router.push({
    path: multiTags.value[(multiTags as any).value.length - 1].path
  });
};

const updateDBDetail = async (id: number | string | string[] | number[]) => {
  try {
    const data = await updateDBInfo(String(id), dbData.value);
    console.log("更新数据库信息----", data);
    dbData.value = data.data;
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

const getDBTypeData = async () => {
  try {
    const data = await getDict({ dict: ["dbtype"] });
    console.log("获取数据库类型下拉框----", data);
    dbType.value = data.data.dbtype;
  } catch (e) {
    console.log(e);
  } finally {
    setTimeout(() => {
      dataLoading.value = false;
    }, 500);
  }
};

const getSysInfoData = async () => {
  try {
    const data = await getSysInfo();
    console.log("获取业务系统对照关系----", data);
    sysInfo.value = data.data;
  } catch (e) {
    console.log(e);
  } finally {
    setTimeout(() => {
      dataLoading.value = false;
    }, 500);
  }
};

const checkDBConnect = async () => {
  checking.value = true;
  try {
    const data = await checkDBConn(dbData.value);
    console.log("数据库连接测试----", data);
    checking.value = false;
    if (data.data) {
      message(data.msg, { type: "success", showClose: true, duration: 3000 });
    } else {
      message(data.msg, { type: "error", showClose: true, duration: 3000 });
    }
  } catch (e) {
    console.log(e);
    checking.value = false;
    message(String(e), { type: "error", showClose: true, duration: 3000 });
  } finally {
    setTimeout(() => {
      checking.value = false;
    }, 3000);
  }
};

onMounted(() => {
  getDBTypeData();
  getSysInfoData();
  getDBDetailData(id);
});
</script>

<template>
  <div class="main">
    <div style="margin-bottom: 20px">
      <h1 align="center">{{ dbData.nickname }} - 数据源详情</h1>
    </div>

    <div
      v-loading="dataLoading"
      :element-loading-svg="svg"
      element-loading-svg-view-box="-10, -10, 50, 50"
    >
      <el-empty description="暂无数据" v-show="dbData.port < 0" />
      <template v-if="dbData.port >= 0">
        <el-form
          :model="dbData"
          ref="dbDataForm"
          label-width="auto"
          class="bg-bg_color w-[99/100] pl-8 pt-4"
          style="padding-bottom: 30px"
        >
          <el-row>
            <el-col :xs="12" :sm="10" :md="8" :lg="6" :xl="4">
              <el-form-item prop="type" label="数据源类型">
                <el-select
                  ref="systemRef"
                  v-model="dbData.type"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="(value, key) in dbType"
                    :key="key"
                    :label="value"
                    :value="key"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="nickname" label="数据源名称">
                <el-input v-model="dbData.nickname" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="host" label="数据库主机">
                <el-input v-model="dbData.host" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="12" :sm="8" :md="6" :lg="4" :xl="4">
              <el-form-item prop="port" label="数据库端口">
                <el-input-number v-model="dbData.port" :min="0" :max="65535" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="username" label="数据库用户名">
                <el-input v-model="dbData.username" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="password" label="数据库密码">
                <el-input
                  v-model="dbData.password"
                  type="password"
                  show-password
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="18" :sm="14" :md="12" :lg="10" :xl="8">
              <el-form-item prop="db_name" label="数据库名">
                <el-input v-model="dbData.db_name" />
              </el-form-item>
            </el-col>
            <el-col :xs="4" :sm="4" :md="2" :lg="2" :xl="2">
              <el-button
                type="success"
                :loading="checking"
                @click="checkDBConnect()"
                >测试连接</el-button
              >
            </el-col>
          </el-row>

          <el-row>
            <el-col :xs="12" :sm="10" :md="8" :lg="6" :xl="4">
              <el-form-item prop="system" label="所属业务系统">
                <el-select
                  ref="systemRef"
                  v-model="dbData.system"
                  placeholder="请选择"
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
          <el-form-item style="margin-left: 100px; margin-top: 20px">
            <el-button type="primary" @click="updateDBDetail(id)"
              >提交</el-button
            >
            <el-button @click="closeTab()">取消</el-button>
          </el-form-item>
        </el-form>
      </template>
    </div>
  </div>
</template>
