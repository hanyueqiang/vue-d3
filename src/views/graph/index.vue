<template>
  <div class="mind-box">
    <!-- 左侧 -->
    <el-scrollbar class="mind-l">
      <div class="ml-m">
        <div class="ml-ht">图谱列表</div>
        <div class="ml-a-box" style="min-height:280px">
          <a
            @click="matchdomaingraph(m,$event)"
            v-for="m in pageModel.nodeList"
            :key="m.id"
            href="javascript:void(0)"
          >
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
    <!-- 右侧 -->
    <div class="mind-con">
      <!-- 头部 -->
      <div class="mind-top clearfix">
        <div class="fl">
          <div class="search" v-show="domain!=''">
            <!-- <el-button @click="getdomaingraph(0)">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-search"></use>
              </svg>
            </el-button> -->
            <!-- <el-button slot="append" icon="el-icon-search" @click="getdomaingraph(0)"></el-button> -->
            <el-input placeholder="请输入内容"  v-model="nodename" @keyup.enter.native="" class="input-with-select">
              <el-button slot="append" icon="el-icon-search" @click="getdomaingraph(0)"></el-button>
            </el-input>
          </div>
          <!-- <span v-show="domain!=''">
	          <spangetdomaingraph :name="aaa" class="dibmr">
				      <span>显示节点个数：</span>
				      <a v-for="(m,index) in pagesizelist" @click="setmatchsize(m,this)" :key="m.id" :title="m.size" href="javascript:void(0)" :class="[m.isactive ? 'sd-active' : '', 'sd']" >{{m.size}}</a>
			      </spangetdomaingraph>
          </span> -->
        </div>
        <div class="fr">
          <a href="javascript:void(0)" @click="requestFullScreen" class="svg-a-sm" >全屏</a>
          <el-dropdown @command="operateCommand">
            <el-button type="primary">
              操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="import">导入</el-dropdown-item>
              <el-dropdown-item command="export">导出</el-dropdown-item>
            </el-dropdown-menu>
		      </el-dropdown>
        </div>
      </div>
      <div class="cypher_toolbar clearfix" v-show="cyphertextshow">
        <div style="width: 80%;float: left"><el-input type="textarea"  :rows="2" placeholder="请输入Cypher" v-model="cyphertext"> </el-input></div>
        <div style="padding: 7px;">
          <el-button type="success" @click="cypherrun" style="margin-left: 15px;" icon="el-icon-caret-right" plain>执行</el-button>
        </div>
		  </div>
      <!-- 中部 --> 
      <el-scrollbar class="mind-cen" id="graphcontainerdiv">

      </el-scrollbar>

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
            name: "ddda"
          },
          {
            id: 1002,
            name: "呼吸内科"
          }
        ]
      },
      pagesizelist: [
        {
          id: 100,
          size: '100'
        }
      ],
      domain: "1",
      nodename: '',
      cyphertextshow: false,
      cyphertext: ''
    };
  },
  computed: {
    ...mapGetters(["roles"])
  },
  methods: {
    matchdomaingraph() {},
    deletedomain() {},
    requestFullScreen() {
      var element = document.getElementById("graphcontainerdiv");
      var width = window.screen.width;
      var height = window.screen.height;
      this.svg.attr("width", width);
      this.svg.attr("height", height);
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
      // FireFox
      else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      }
      // Chrome等
      else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
      }
      // IE11
      else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    },
    getdomaingraph() {
            var _this = this;
            _this.loading = true;
            var data = {
                domain: _this.domain,
                nodename: _this.nodename,
                pageSize: _this.pagesize
            }
            $.ajax({
                data: data,
                type: "POST",
                url: contextRoot + "getdomaingraph",
                success: function (result) {
                    if (result.code == 200) {
                        var graphModel = result.data;
                        if (graphModel != null) {
                            _this.graph.nodes = graphModel.node;
                            _this.graph.links = graphModel.relationship;
                            _this.updategraph();
                        }
                    }
                }
            });
    },
    operateCommand(command) {
            if (command === 'image') {
                this.exportimage();
            }
            if (command === 'import') {
                this.dialogFormVisible = true;
            }
            if (command === 'export') {
                this.exportFormVisible = true;
            }
    },
    cypherrun(){
            var _this = this;
            if(_this.cyphertext==""){
                _this.$message.error("请输入cypher语句");
                return;
            }
            var data = {cypher: _this.cyphertext};
            $.ajax({
                data: data,
                type: "POST",
                url: contextRoot + "getcypherresult",
                success: function (result) {
                    if (result.code == 200) {
                        _this.graph.nodes = result.data.node;
                        _this.graph.links = result.data.relationship;
                        _this.updategraph();
                    }else{
                        _this.$message.error(result.msg);
                    }
                }
            })
        },
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
ul {
  list-style-type: none;
}
.fl {
  float: left;
}
.fr {
  float: right;
}
.mind-box {
  height: calc(100vh - 50px);
  overflow: hidden;
}
.mind-l {
  width: 260px;
  float: left;
  background: #f7f9fc;
  height: 100%;
  border-right: 1px solid #d3e2ec;
}
.ml-ht {
  height: 70px;
  line-height: 70px;
  font-size: 16px;
  font-weight: 400;
  text-align: center;
  color: #333;
  border-bottom: 1px solid #d3e2ec;
}
.ml-a-box {
  margin: 10px;
}
.hometitle {
  font-size: 18px;
  color: #282828;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  padding-bottom: 15px;
  margin-bottom: 25px;
  position: relative;
}
.hometitle:after {
  content: "";
  background-color: #282828;
  left: 0;
  width: 50px;
  height: 2px;
  bottom: 0;
  position: absolute;
  -webkit-transition: 0.5s;
  -moz-transition: 0.5s;
  -ms-transition: 0.5s;
  -o-transition: 0.5s;
  transition: 0.5s;
}
.mind-con {
  height: 100%;
  overflow: hidden;
  background: #fff;
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
}
.mind-top {
  line-height: 70px;
  height: 70px;
  padding: 0 22px;
  border-bottom: 1px solid #ededed;
}
.mind-top .search {
  width: 260px;
}
.svg-a-sm {
    font-size: 14px;
    color: #156498;
    margin-right: 30px;
}

</style>
