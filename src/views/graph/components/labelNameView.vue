<template>
  <div class="ml-a-box" style="min-height:280px">
    <a href="javascript:void(0)" @click="matchAlldomaingraph()">
      <el-tag style="margin:2px" effect="dark" :type="domain == '全部' ? 'success': ''">全部</el-tag>
    </a>
    <a
      @click="matchdomaingraph(m,$event)"
      v-for="m in pageModel.nodeList"
      :key="m.id"
      href="javascript:void(0)"
    >
      <el-tag
        closable
        style="margin:2px"
        effect="dark"
        :type="domain == m.name ? 'success': ''"
        @close="deletedomain(m.id,m.name)"
      >{{m.name}}</el-tag>
    </a>
    <!-- <el-button
      v-if="pageModel.pageIndex<pageModel.totalPage"
      type="info"
      style="margin: 2px 0 4px 2px;"
      plain
      size="small"
      @click="getmoredomain"
    >加载更多</el-button>-->
  </div>
</template>

<script>
export default {
  props: {
    domain: {
      type: String,
      default: ""
    },
    pageModel: {
      type: Object
    }
  },
  data() {
    return {};
  },
  methods: {
    matchAlldomaingraph: function() {
      this.$emit("matchAlldomaingraph");
    },
    deletedomain: function(id, value) {
      this.$emit("deletedomain", id, value);
    },
    matchdomaingraph: function(m) {
      this.$emit("matchdomaingraph", m);
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
