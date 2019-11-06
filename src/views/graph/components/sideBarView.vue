<template>
  <div class="ml-a-box">
    <div class="silder-catlog-tag">
      <a
        @click="catalogToggleHandle(m,$event)"
        v-for="m in catalogModels"
        :key="m.id"
        href="javascript:void(0)"
      >
        <el-tag style="margin:2px" :type="catalogkey == m.id ? 'warning': ''">{{m.name}}</el-tag>
      </a>
    </div>
    <div v-show="catalogkey == 1" class="silder-catlog-radio">
      <el-radio-group v-model="radio" @change="catlogRadioChange">
        <el-radio :label="5">常见病</el-radio>
        <el-radio :label="6">科室</el-radio>
        <el-radio :label="7">ICD10</el-radio>
      </el-radio-group>
    </div>
    <div class="silder-trees">
      <el-tree
        :data="treeData"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :render-content="renderContent"
        empty-text
        highlight-current
      ></el-tree>
    </div>
  </div>
</template>

<script>
// import { getTree } from '@/api/graph';
export default {
  props: {},
  data() {
    return {
      catalogModels: [
        { id: 1, name: "疾病" },
        { id: 2, name: "药物" },
        { id: 3, name: "症状" },
        { id: 4, name: "诊疗" }
      ],
      catalogkey: 1, //默认疾病
      radio: 5,
      dataSource: [], // tree源数据
      defaultProps: {
        children: "children",
        label: "name"
      },
      treeLoading: false,
      contextRoot: "/kgmaker"
    };
  },
  created() {
    this.getTreeFetch();
  },
  computed: {
    treeData() {
      let cloneData = JSON.parse(JSON.stringify(this.dataSource)); // 对源数据深度克隆
      return cloneData.filter(father => {
        let branchArr = cloneData.filter(child => father.id == child.pid); //返回每一项的子级数组
        branchArr.length > 0 ? (father.children = branchArr) : ""; //如果存在子级，则给父级添加一个children属性，并赋值
        return father.pid == 0; //返回第一层
      });
    }
  },
  methods: {
    getTreeFetch() {
      //this.treeLoading = true;
      let id = this.catalogkey === 1 ? this.radio : this.catalogkey;
      let _this = this;
      let data = {
        mid: id
      };
      $.ajax({
        dataType: "json",
        data: JSON.stringify(data),
        contentType: "application/json;",
        type: "POST",
        url: _this.contextRoot + "/restapi/v1/tree/load",
        success: function(result) {
          if (result.code == 200) {
            _this.dataSource = result.data || [];
          }
        }
      });
    },
    catalogToggleHandle: function(m) {
      this.catalogkey = m.id;
      if (m.id === 1) {
        this.radio = 5;
      }
      this.getTreeFetch();
    },
    deletedomain: function(id, value) {
      //this.$emit("deletedomain", id, value);
    },
    matchdomaingraph: function(m) {
      //this.$emit("matchdomaingraph", m);
    },
    catlogRadioChange: function(val) {
      this.radio = val;
      this.getTreeFetch();
    },
    handleNodeClick(data) {
      if (data.children) return;
      this.$emit("getNodesChange", data.name);
    },
    renderContent(h, { node, data, store }) {
      // let imgSrc = node.icon ? require(node.icon): '';
      return (
        <span style="flex: 1; display: flex; align-items: center; justify-content: space-between; font-size: 14px; padding-right: 8px;">
          <span>
            <i class={`el-icon-share graph-node-class ${node.icon}`}></i>
            <span title={node.label}>{node.label}</span>
          </span>
        </span>
      );
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.silder-catlog-tag {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  padding: 0 15px;
  margin-top: 15px;
  margin-bottom: 10px;
}
.silder-catlog-radio {
  height: 28px;
  line-height: 28px;
  padding-left: 28px;
  margin-bottom: 10px;
}
.silder-trees {
  overflow: auto;
  flex: 1;
  border-top: 1px solid #ededed;
}
.silder-trees .el-tree-node > div {
  overflow: inherit !important;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.graph-node-class {
  margin-right: 5px;
}
.graph-child-node {
  color: goldenrod;
}
.graph-leaf-node {
  color: green;
}
</style>
