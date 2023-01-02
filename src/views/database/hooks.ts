import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute } from "vue-router";
import { onBeforeMount } from "vue";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const id = route.query?.id ? route.query?.id : route.params?.id;

  function toDetail(index: number | string | string[] | number[]) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/database/detail/:id`,
      name: "DBInfoDetail",
      params: { id: String(index) },
      meta: {
        title: "数据源详情"
      }
    });
    router.push({ name: "DBInfoDetail", params: { id: String(index) } });
  }

  function toAdd() {
    useMultiTagsStoreHook().handleTags("push", {
      path: "/database/add",
      name: "DBInfoAdd",
      meta: {
        title: "新增数据源"
      }
    });
    router.push({ name: "DBInfoAdd" });
  }

  function initToDetail() {
    onBeforeMount(() => {
      if (id) toDetail(id);
    });
  }

  return { toDetail, toAdd, initToDetail, id, router };
}
