import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute } from "vue-router";
import { onBeforeMount } from "vue";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const id = route.query?.id ? route.query?.id : route.params?.id;

  function toDetail(index: number | string | string[] | number[]) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/system/detail/:id`,
      name: "SystemDetail",
      params: { id: String(index) },
      meta: {
        title: "业务系统详情"
      }
    });
    router.push({ name: "SystemDetail", params: { id: String(index) } });
  }

  function toAdd() {
    useMultiTagsStoreHook().handleTags("push", {
      path: "/system/add",
      name: "SystemAdd",
      meta: {
        title: "新增业务系统"
      }
    });
    router.push({ name: "SystemAdd" });
  }

  function initToDetail() {
    onBeforeMount(() => {
      if (id) toDetail(id);
    });
  }

  return { toDetail, toAdd, initToDetail, id, router };
}
