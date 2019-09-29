<template>
  <div class="graph-container">
    <div class="mind-box">
      <el-scrollbar class="mind-l">
        <div class="ml-m">
          <h2 class="ml-ht">图谱列表</h2>
          <div class="ml-a-box" style="min-height:280px">
            <a @click="matchdomaingraph(m,$event)" v-for="m in pageModel.nodeList" :key="m.id" href="javascript:void(0)">
              <el-tag closable style="margin:2px" @close="deletedomain(m.id,m.name)">{{m.name}}</el-tag>
            </a>
            <el-button
              v-if="pageModel.pageIndex<pageModel.totalPage"
              type="info"
              style="margin: 2px 0 4px 2px;"
              plain
              size="small"
              @click="getmoredomain"
            >加载更多</el-button>
          </div>
          <div id="follow-us" class="guanzhu" style="padding: 20px;">
            <h2 class="hometitle">最新变动</h2>
            <ul>
              <li class="wx"></li>
            </ul>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="mind-content">

    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "graph",
  data() {
    return {
      pageModel: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0,
        nodeList: [
          {
            id: 1001,
            name: 'ddda'
          },
          {
            id: 1002,
            name: '呼吸内科'
          },
        ]
      },
    }
  },
  computed: {
    ...mapGetters(["roles"])
  },
  methods: {
    matchdomaingraph() {
    	
    },
    deletedomain() {
    	
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .graph-container {
    display: flex;
    padding: 10px;
  }
</style>
