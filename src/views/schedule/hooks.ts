import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute } from "vue-router";
import { onBeforeMount } from "vue";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const id = route.query?.id ? route.query?.id : route.params?.id;

  function toDetail(index: number | string | string[] | number[]) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/schedule/detail/:id`,
      name: "ScheduleDetail",
      params: { id: String(index) },
      meta: {
        title: "任务详情"
      }
    });
    router.push({ name: "ScheduleDetail", params: { id: String(index) } });
  }

  function toAdd() {
    useMultiTagsStoreHook().handleTags("push", {
      path: "/schedule/add",
      name: "ScheduleAdd",
      meta: {
        title: "新增任务"
      }
    });
    router.push({ name: "ScheduleAdd" });
  }

  function initToDetail() {
    onBeforeMount(() => {
      if (id) toDetail(id);
    });
  }

  return { toDetail, toAdd, initToDetail, id, router };
}
