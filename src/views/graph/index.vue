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
            <el-tag
              closable
              style="margin:2px"
              effect="dark"
              :type="domain == m.name ? 'success': ''"
              @close="deletedomain(m.id,m.name)"
            >{{m.name}}</el-tag>
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
        <div class="fl graph-search">
          <div class="search" v-show="domain!=''">
            <el-select v-model="selectRelation" class="search-select-first" @change="selectRelationHandle">
              <el-option value="NODE" label="节点"></el-option>
              <el-option value="RELATION" label="关系"></el-option>
            </el-select>
            <el-select v-model="selectNodeRelation" class="search-select-second">
              <el-option
                v-for="item in nodeRelations"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
            <el-input
              placeholder="请输入内容"
              v-model="nodename"
              @keyup.enter.native="getNodeSearchGraph(0)"
              class="input-with-select"
            >
              <el-button slot="append" icon="el-icon-search" @click="getNodeSearchGraph(0)"></el-button>
            </el-input>
          </div>
          <span v-show="domain!=''">
            <span>
              <span>显示节点个数：</span>
              <a
                v-for="m in pagesizelist"
                @click="setmatchsize(m,this)"
                :key="m.id"
                :title="m.size"
                href="javascript:void(0)"
                :class="[m.isactive ? 'sd-active' : '', 'sd']"
              >{{m.size}}</a>
            </span>
          </span>
          <ul class="color-represent" v-show="domain!=''">
            <li
              v-for="(m, index) in colorModels"
              :key="index"
              :style="{ background: m.color }"
              class="color-represent-single"
            >{{m.name}}</li>
          </ul>
        </div>
        <div class="fr">
          <a href="javascript:void(0)" @click="requestFullScreen" class="svg-a-sm">全屏</a>
          <!-- <el-dropdown @command="operateCommand">
            <el-button type="primary">
              操作
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="import">导入</el-dropdown-item>
              <el-dropdown-item command="export">导出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown> -->
        </div>
      </div>
      <div class="cypher_toolbar clearfix" v-show="cyphertextshow">
        <div style="width: 80%;float: left">
          <el-input type="textarea" :rows="2" placeholder="请输入Cypher" v-model="cyphertext"></el-input>
        </div>
        <div style="padding: 7px;">
          <el-button
            type="success"
            @click="cypherrun"
            style="margin-left: 15px;"
            icon="el-icon-caret-right"
            plain
          >执行</el-button>
        </div>
      </div>
      <!-- 中部 -->
      <el-scrollbar class="mind-cen" id="graphcontainerdiv">
        <div id="nodedetail" class="node_detail">
          <span class="node_pd">详细数据:</span>
          <span class="node_pd" v-for="(m,k) in nodedetail" :key="k">{{k}}:{{m}}</span>
        </div>
        <el-scrollbar v-show="jsonshow" id="jsoncontainer" class="jsoncontainer">
          <pre id="json-renderer"></pre>
        </el-scrollbar>
        <div id="graphcontainer" class="graphcontainer"></div>
      </el-scrollbar>
      <!-- 中部over -->
      <div class="svg-set-box"></div>
      <!-- 底部 -->
      <el-dialog title="csv导入图谱" :visible.sync="dialogFormVisible" width="30%">
        <el-form>
          <div>
            <span>注意字符集为utf-8无bom格式，三元组结构：节点-节点-关系</span>
          </div>
          <el-form-item label="图谱领域" label-width="120px">
            <el-autocomplete style="width:100%" v-model="uploadparam.domain" placeholder="请输入内容">
              <!--:fetch-suggestions="querySearch"-->
            </el-autocomplete>
          </el-form-item>
          <el-form-item label="选择文件" label-width="120px">
            <el-upload
              class
              :headers="headers"
              ref="upload"
              :action="uploadurl"
              accept=".csv, .xls, .xlsx"
              :show-file-list="true"
              :data="uploadparam"
              :on-success="csvsuccess"
              :auto-upload="false"
            >
              <el-button
                slot="trigger"
                class="btn-bo"
                style="padding: 12px 24px;margin-bottom: 0px;"
              >
                选择文件
              </el-button>
            </el-upload>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitUpload">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="导出图谱csv" :visible.sync="exportFormVisible" width="30%">
        <el-form>
          <el-form-item label="图谱领域" label-width="120px">
            <el-autocomplete style="width:100%" v-model="uploadparam.domain" placeholder="请输入内容">
              <!--:fetch-suggestions="querySearch"-->
            </el-autocomplete>
          </el-form-item>
          <el-button type="primary" @click="exportcsv">确 定</el-button>
        </el-form>
      </el-dialog>
      <el-dialog
        id="editform"
        title="属性编辑"
        :visible.sync="isedit"
        width="30%"
        :append-to-body="true"
      >
        <el-tabs
          type="card"
          tab-position="top"
          v-model="propactiveName"
          @tab-click="prophandleClick"
        >
          <el-tab-pane label="属性编辑" name="propedit">
            <el-form :model="graphEntity">
              <el-form-item label="节点名称">
                <el-input v-model="graphEntity.name"></el-input>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <div slot="footer" class="dialog-footer">
          <el-button
            v-show="propactiveName=='propimage'"
            type="primary"
            @click="savenodeimage"
            class="btn-line cur"
          >保存</el-button>
          <el-button
            v-show="propactiveName=='richtextedit'"
            @click="savenodecontent"
            type="primary"
            class="btn-line cur"
          >保存</el-button>
          <el-button
            v-show="propactiveName=='propedit'&&graphEntity.uuid!=0"
            type="primary"
            @click="createnode"
          >更新</el-button>
          <el-button
            v-show="propactiveName=='propedit'&&graphEntity.uuid==0"
            type="primary"
            @click="createnode"
          >创建</el-button>
          <el-button @click="resetsubmit">取消</el-button>
        </div>
      </el-dialog>
      <!-- 属性编辑 -->
      <el-dialog
        id="attrcreateform"
        title="属性编辑"
        :visible.sync="isATTRcreate"
        width="540px"
        :append-to-body="true"
      >
        <div class="mb-r">
          <div class="mb-m">
            <div class="user-attr-define">自定义属性(最多添加5个)</div>
            <div v-for="(item, index) in newAttrFormModel" :key="index" class="user-attrs">
              <span class="user-attrs-span">
                key:
                <el-input class="user-attrs-item" v-model="item.key" v-bind:disabled="attrDisabledHandle(item.key)"></el-input>
              </span>
              <span class="user-attrs-span">
                value:
                <el-input class="user-attrs-item" v-model="item.value" v-bind:disabled="attrDisabledHandle(item.key)"></el-input>
              </span>
              <span class="user-attrs-del" @click="onDelAttrVal(index)" v-show="!attrDisabledHandle(item.key)">删除</span>
            </div>
            <el-button type="primary" @click="addUserAttrHandle" :disabled="newAttrFormModel.length >= 10">添加自定义属性</el-button>
          </div>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="attrformSubmit">确定</el-button>
          <el-button @click="resetattrCancel">取消</el-button>
        </div>
      </el-dialog>
      <!-- 右键添加节点 -->
      <el-dialog
        id="rightAddNodeform"
        title="添加节点"
        :visible.sync="isRightAddNode"
        width="400px"
        :append-to-body="true"
      >
        <div>
          <div class="mb-label">节点名称</div>
          <el-input v-model="addNodeName"></el-input>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="rightAddNodeSubmit">确定</el-button>
          <el-button @click="rightAddNodeCancel">取消</el-button>
        </div>
      </el-dialog>
      <el-dialog
        id="batchcreateform"
        :title="operatenameformat(operatetype)"
        :visible.sync="isbatchcreate"
        width="30%"
        :append-to-body="true"
      >
        <div v-show="operatetype==1" class="mb-l">添加同级</div>
        <div v-show="operatetype==2" class="mb-l">添加下级</div>
        <div v-show="operatetype==3" class="mb-l">批量添加</div>
        <div v-show="operatetype==4" class="mb-l">段落识别</div>
        <div class="mb-r">
          <div v-show="operatetype!=2" class="mb-m">
            <div class="mb-label">源节点名称</div>
            <div class="mb-con">
              <el-input v-model="batchcreate.sourcenodename"></el-input>
              <span v-show="operatetype==3" class="mb-label">（只能添加一个）</span>
              <span v-show="operatetype==1" class="mb-label">（多个以英文逗号隔开）</span>
            </div>
            <div class="mb-label" v-show="operatetype!==1">关系</div>
            <div class="mb-con" v-show="operatetype!==1">
              <el-input v-model="batchcreate.relation"></el-input>
              <div class="mb-label">（只能添加一个）</div>
            </div>
          </div>
          <div v-show="operatetype!=1" class="mb-m">
            <div class="mb-label">子节点名称</div>
            <div class="mb-con">
              <el-input v-model="batchcreate.targetnodenames"></el-input>
              <span class="mb-label" v-show="operatetype==3">（多个以英文逗号隔开,可不填）</span>
              <span class="mb-label" v-show="operatetype==2">（多个以英文逗号隔开）</span>
            </div>
          </div>
          <div class="mb-m tc">
            <el-button v-show="operatetype==1" type="primary" @click="batchcreatesamenode">确定</el-button>
            <el-button v-show="operatetype==2" type="primary" @click="batchcreatechildnode">确定</el-button>
            <el-button v-show="operatetype==3" type="primary" @click="batchcreatenode">确定</el-button>
            <el-button @click="resetsubmit">取消</el-button>
          </div>
        </div>
      </el-dialog>
      <!-- 底部over -->
    </div>
    <!-- 右侧over -->
    <!-- 空白处右键 -->
    <ul class="el-dropdown-menu el-popper blankmenubar" id="blank_menubar" style="display: none;">
      <li class="el-dropdown-menu__item" @click="rightAddNodeHandle">
        <i class="el-icon-plus"></i>
        <span class="pl-15">添加节点</span>
      </li>
      <!-- <li class="el-dropdown-menu__item" @click="btnaddsingle">
        <i class="el-icon-plus"></i>
        <span class="pl-15">添加节点</span>
      </li> -->
      <!-- <li class="el-dropdown-menu__item" @click="btnquickaddnode">
        <span class="pl-15">快速添加</span>
      </li>
      <li class="el-dropdown-menu__item" @click="btnquickaddnode">
        <span class="pl-15">删除节点</span>
      </li> -->
    </ul>
    <!-- 连线按钮组 -->
    <ul class="el-dropdown-menu el-popper linkmenubar" id="link_menubar" style="display: none;">
      <li class="el-dropdown-menu__item" @click="updatelinkName">
        <span class="pl-15">编辑</span>
      </li>
      <li class="el-dropdown-menu__item" @click="deletelink">
        <span class="pl-15">删除</span>
      </li>
    </ul>
    <!-- 富文本展示 -->
    <div id="richContainer" style="display: none;width: 400px">
      <div class="mind-fj-box" v-show="showImageList.length>0 ||editorcontent!=''">
        <div class="mind-carousel" v-show="showImageList.length>0">
          <el-carousel height="197px" :interval="2000" arrow="always">
            <el-carousel-item v-for="item in showImageList" :key="item.ID">
              <div class="carous-img">
                <img :src="item.FileName" alt />
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        <el-scrollbar v-show="editorcontent!=''" class="mind-fj-p">
          <p v-html="editorcontent"></p>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import $ from "jquery";
import _ from "lodash";
import * as d3 from "d3";

export default {
  name: "graph",
  data() {
    return {
      svg: null,
      timer: null,
      editor: null,
      simulation: null,
      linkGroup: null,
      linktextGroup: null,
      nodeGroup: null,
      nodetextGroup: null,
      nodesymbolGroup: null,
      nodebuttonGroup: null,
      nodebuttonAction: "",
      tooltip: null,
      tipsshow: true,
      txx: {},
      tyy: {},
      nodedetail: null,
      selectAttribute: 'name',
      pagesizelist: [
        { size: 100, isactive: true },
        { size: 200, isactive: false },
        { size: 500, isactive: false }
      ],
      colorList: [
        "#ff8373",
        "#f9c62c",
        "#a5ca34",
        "#6fce7a",
        "#70d3bd",
        "#ea91b0"
      ],
      color5: "#ff4500",
      predefineColors: [
        "#ff4500",
        "#ff8c00",
        "#90ee90",
        "#00ced1",
        "#1e90ff",
        "#c71585"
      ],
      fillColorList: [
        "#f16667",
        "#ecb5c9",
        "#c990c0",
        "#569480",
        "#57c7e3",
        "#d9c8ae",
        "#4c8eda",
        "#ffc454",
        "#da7194",
        "#8dcc93"
      ],
      colorModels: [],
      defaultcr: 30,
      activeName: "",
      dataconfigactive: "",
      querywords: "",
      operatetype: 0,
      isedit: false,
      isaddnode: false,
      isaddlink: false,
      isdeletelink: false,
      isbatchcreate: false,
      isATTRcreate: false,
      selectnodeid: 0,
      selectnodename: "",
      selectsourcenodeid: 0,
      selecttargetnodeid: 0,
      selectstartuuid: 0,
      selectenduuid: 0,
      sourcenodex1: 0,
      sourcenodey1: 0,
      mousex: 0,
      mousey: 0,
      domain: "",
      domainid: 0,
      nodename: "",
      pagesize: 100,
      cyphertext: "",
      cyphertextshow: false,
      jsonshow: false,
      propactiveName: "propedit",
      contentactiveName: "propimage",
      uploadimageurl: "/qiniu/upload",
      uploadimageparam: {},
      nodeimagelist: [],
      netimageurl: "",
      dialogimageVisible: false,
      dialogImageUrl: "",
      showImageList: [],
      editorcontent: "",
      selectnode: {
        name: "",
        count: 0
      },
      pageModel: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        totalPage: 0,
        nodeList: []
      },
      graph: {
        nodes: [],
        links: []
      },
      batchcreate: {
        sourcenodename: "",
        targetnodenames: "",
        relation: ""
      },
      attrDisabledList: ['id', 'name', 'labelName', 'status', 'uuid'],
      newAttrFormModel: [],
      originalNodesData:[],
      graphEntity: {
        uuid: 0,
        name: "",
        color: "ff4500",
        r: 30,
        x: "",
        y: ""
      },
      uploadparam: { domain: "" },
      domainlabels: [],
      dialogFormVisible: false,
      exportFormVisible: false,
      headers: {},
      uploadurl: "/importgraph",
      colorRepresentList: [
        {
          name: "科室",
          color: "#ff4500"
        },
        {
          name: "症状",
          color: "#f16667"
        },
        {
          name: "伴随症状",
          color: "#d9c8ae"
        },
        {
          name: "疾病",
          color: "#57c7e3"
        }
      ],
      nodeRelations: [],
      selectRelation: 'NODE',
      selectNodeRelation: 'name',
      nodeAttributes: [],
      relationAttributes: [],
      isRightAddNode: false,
      addNodeName: '',
      contextRoot: "/kgmaker",
      expandedNodeMap: {},
      nodeMap: {},
      relationshipMap: {}
    };
  },
  filters: {
    labelformat: function(value) {
      var domain = value.substring(1, value.length - 1);
      return domain;
    }
  },
  computed: {
    ...mapGetters(["roles"])
  },
  mounted() {
    var token = $("meta[name='_csrf']").attr("content");
    var header = $("meta[name='_csrf_header']").attr("content");
    var str = '{ "' + header + '": "' + token + '"}';
    this.headers = eval("(" + str + ")");
    this.initJqEvents();
    this.initgraph();
  },
  created() {
    this.getlabels();
  },
  methods: {
    //删除一条属性编辑
    onDelAttrVal(index) {
      this.newAttrFormModel.splice(index, 1);
    },
    //属性编辑禁止
    attrDisabledHandle(key) {
      if(this.attrDisabledList.indexOf(key) != -1) {
        return true;
      }
      return false;
    },
    addUserAttrHandle(event) {
      this.newAttrFormModel.push({ key: "", value: "" });
      event.preventDefault();
    },
    selectRelationHandle(value) {
      let arr;
      let label;
      if(value === 'NODE') {
        arr = this.nodeAttributes;
        label = 'name';
      }else {
        arr = this.relationAttributes;
        label = 'relation';
      }
      this.nodeRelations = arr;
      this.selectNodeRelation = label;
    },
    initJqEvents() {
      var _this = this;
      $(".blankmenubar").click(function() {
        $("#blank_menubar").hide();
      });
      $(".blankmenubar").mouseleave(function() {
        $("#blank_menubar").hide();
      });
      $(".graphcontainer").bind("contextmenu", function(event) {
        _this.svg.selectAll(".buttongroup").classed("circle_opreate", true);
        var left = event.clientX;
        var top = event.clientY;
        _this.txx = event.offsetX;
        _this.tyy = event.offsetY;
        console.log(left, top);
        document.getElementById("blank_menubar").style.position = "fixed";
        document.getElementById("blank_menubar").style.left = left + "px";
        document.getElementById("blank_menubar").style.top = top + "px";
        $("#blank_menubar").show();
        event.preventDefault();
      });
      $(".graphcontainer").bind("click", function(event) {
        if (
          event.target.tagName != "circle" &&
          event.target.tagName != "link"
        ) {
          d3.select("#nodedetail").style("display", "none");
        }
        if (
          !(
            event.target.id === "jsoncontainer" ||
            $(event.target).parents("#jsoncontainer").length > 0
          )
        ) {
          _this.jsonshow = false;
        }
        var cursor = document.getElementById("graphcontainer").style.cursor;
        if (cursor == "crosshair") {
          d3.select(".graphcontainer").style("cursor", "");
          _this.txx = event.offsetX;
          _this.tyy = event.offsetY;
          _this.createSingleNode();
        }
        event.preventDefault();
      });

      $(".linkmenubar").bind("mouseleave", function(event) {
        d3.select("#link_menubar").style("display", "none");
      });
      $("body").bind("mousedown", function(event) {
        if (
          !(
            event.target.id === "linkmenubar" ||
            $(event.target).parents("#linkmenubar").length > 0
          )
        ) {
          $("#linkmenubar").hide();
        }
        if (
          !(
            event.target.id === "batchcreateform" ||
            $(event.target).parents("#batchcreateform").length > 0
          )
        ) {
          _this.isbatchcreate = false;
        }
        if (
          !(
            event.target.id === "richContainer" ||
            $(event.target).parents("#richContainer").length > 0
          )
        ) {
          $("#richContainer").hide();
        }
        if (
          !(
            event.target.id === "nodedetail" ||
            $(event.target).parents("#nodedetail").length > 0
          )
        ) {
          d3.select("#nodedetail").style("display", "none");
        }
      });
    },
    btntipsclose() {
      this.tipsshow = false;
    },
    showCypher() {
      this.cyphertextshow = !this.cyphertextshow;
    },
    cypherjson() {
      if (this.graph.nodes.length == 0 && this.graph.links.length == 0) {
        this.$message.error("请先选择领域或者执行cypher");
        return;
      }
      this.jsonshow = !this.jsonshow;
      var json = this.graph;
      var options = {
        collapsed: false, //收缩所有节点
        withQuotes: false //为key添加双引号
      };
      $("#json-renderer").JSONView(json, options);
    },
    cypherrun() {
      var _this = this;
      if (_this.cyphertext == "") {
        _this.$message.error("请输入cypher语句");
        return;
      }
      var data = { cypher: _this.cyphertext };
      $.ajax({
        data: data,
        type: "POST",
        //url: "/getcypherresult",
        url: _this.contextRoot + "/getcypherresult",
        success: function(result) {
          if (result.code == 200) {
            _this.graph.nodes = result.data.node;
            _this.graph.links = result.data.relationship;
            _this.updategraph();
          } else {
            _this.$message.error(result.msg);
          }
        }
      });
    },
    initEditor() {
      var _this = this;
      if (_this.editor != null) return;
      var E = window.wangEditor;
      _this.editor = new E(this.$refs.eidtorToolbar, this.$refs.eidtorContent);
      _this.editor.customConfig.onchange = function(html) {
        _this.editorcontent = html;
      };
      var token = $("meta[name='_csrf']").attr("content");
      var header = $("meta[name='_csrf_header']").attr("content");
      var str = '{ "' + header + '": "' + token + '"}';
      var headers = eval("(" + str + ")");
      _this.editor.customConfig.uploadFileName = "file";
      _this.editor.customConfig.uploadImgHeaders = headers;
      _this.editor.customConfig.uploadImgServer = "/qiniu/upload"; // 上传图片到服务器
      _this.editor.customConfig.uploadImgHooks = {
        // 如果服务器端返回的不是 {errno:0, data: [...]} 这种格式，可使用该配置
        // （但是，服务器端返回的必须是一个 JSON 格式字符串！！！否则会报错）
        customInsert: function(insertImg, res, editor) {
          // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
          // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果
          for (var i = 0; i < res.results.length; i++) {
            var fileitem = res.results[i];
            insertImg(fileitem.url);
          }
        }
      };
      _this.editor.create();
    },
    initNodeContent() {
      var _this = this;
      var data = { domainid: _this.domainid, nodeid: _this.selectnodeid };
      $.ajax({
        data: data,
        type: "POST",
        //url: "/getnodecontent",
        url: _this.contextRoot + "/getnodecontent",
        success: function(result) {
          _this.editor.txt.html("");
          if (result.code == 200) {
            _this.editorcontent = result.data.Content;
            editor.txt.html(result.data.Content);
          }
        }
      });
    },
    initNodeImage() {
      var _this = this;
      var data = { domainid: _this.domainid, nodeid: _this.selectnodeid };
      $.ajax({
        data: data,
        type: "POST",
        //url: contextRoot + "getnodeimage",
        //url: "/getnodeimage",
        url: _this.contextRoot + "/getnodeimage",
        success: function(result) {
          if (result.code == 200) {
            for (var i = 0; i < result.data.length; i++) {
              _this.nodeimagelist.push({
                fileurl: result.data[i].FileName,
                imagetype: result.data[i].ImageType
              });
            }
          }
        }
      });
    },
    getNodeDetail(nodeid) {
      var _this = this;
      var data = { domainid: _this.domainid, nodeid: nodeid };
      $.ajax({
        data: data,
        type: "POST",
        //url: "/getnodedetail",
        url: _this.contextRoot + "/getnodedetail",
        success: function(result) {
          if (result.code == 200) {
            _this.editorcontent = result.data.content;
            _this.showImageList = result.data.imagelist;
          }
        }
      });
    },
    savenodeimage() {
      var _this = this;
      var data = {
        domainid: _this.domainid,
        nodeid: _this.selectnodeid,
        imagelist: JSON.stringify(_this.nodeimagelist)
      };
      $.ajax({
        dataType: "json",
        data: JSON.stringify(data),
        contentType: "application/json; charset=UTF-8",
        type: "POST",
        //url: "/savenodeimage",
        url: _this.contextRoot + "/savenodeimage",
        success: function(result) {
          if (result.code == 200) {
            _this.$message({
              message: "操作成功",
              type: "success"
            });
          }
        }
      });
    },
    savenodecontent() {
      var _this = this;
      var data = {
        domainid: _this.domainid,
        nodeid: _this.selectnodeid,
        content: _this.editorcontent
      };
      $.ajax({
        dataType: "json",
        data: JSON.stringify(data),
        contentType: "application/json; charset=UTF-8",
        type: "POST",
        //url: "/savenodecontent",
        url: _this.contextRoot + "/savenodecontent",
        success: function(result) {
          if (result.code == 200) {
            _this.$message({
              message: "操作成功",
              type: "success"
            });
          }
        }
      });
    },
    handlePictureCardPreview(item) {
      this.dialogImageUrl = this.imageurlformat(item);
      this.dialogimageVisible = true;
    },
    addnetimage() {
      if (this.netimageurl != "") {
        this.nodeimagelist.push({ file: this.netimageurl, imagetype: 1 });
        this.netimageurl = "";
      }
    },
    imagehandleRemove(url) {
      this.nodeimagelist.splice(this.nodeimagelist.indexOf(url), 1);
    },
    imageurlformat(item) {
      return item.fileurl;
    },
    dbimageurlformat(item) {
      return item.FileName;
    },
    uploadsuccess(res, file) {
      if (res.success == 1) {
        for (var i = 0; i < res.results.length; i++) {
          var fileitem = res.results[i];
          this.nodeimagelist.push({ fileurl: fileitem.url });
        }
      } else {
        this.$message.error(res.msg);
      }
    },
    prophandleClick(tab, event) {
      if (tab.name == "richtextedit") {
        this.editorcontent = "";
        this.initNodeContent();
        this.initEditor();
      }
      if (tab.name == "propimage") {
        this.nodeimagelist = [];
        this.initNodeImage();
      }
    },
    operatenameformat() {
      if (this.operatetype == 1) {
        return "添加同级";
      } else if (this.operatetype == 2) {
        return "添加下级";
      } else if (this.operatetype == 3) {
        return "批量添加";
      }
    },
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
        nodename: '',
        pageSize: _this.pagesize
      };
      $.ajax({
        data: data,
        type: "POST",
        //url: "/getdomaingraph",
        url: _this.contextRoot + "/getdomaingraph",
        success: function(result) {
          if (result.code == 200) {
            var graphModel = result.data;
            if (graphModel != null) {
              _this.graph.nodes = graphModel.node;
              _this.originalNodesData = _.cloneDeep(graphModel.node);
              _this.graph.links = graphModel.relationship;
              _this.updategraph();
            }
          }
        }
      });
    },
    getNodeSearchGraph() {
      var _this = this;
      _this.loading = true;
      //domain: _this.domain,
      let data = {
        type: _this.selectRelation,
        attribute: _this.selectNodeRelation,
        content: _this.nodename,
        pageSize: _this.pagesize
      };
      $.ajax({
        data: JSON.stringify(data),
        type: "POST",
        url: _this.contextRoot + "/restapi/v1/node/search",
        contentType: 'application/json',
        success: function(result) {
          if (result.code == 200) {
            var graphModel = result.data;
            if (graphModel != null) {
              let nodes = graphModel.node ? graphModel.node : [];
              let relationships = graphModel.relationship ? graphModel.relationship : [];
              _this.graph.nodes = nodes;
              _this.originalNodesData = _.cloneDeep(nodes);
              _this.graph.links = relationships;
              _this.updategraph();
            }
          }
        }
      });
    },
    getcurrentnodeinfo(node) {
      var _this = this;
      var data = { domain: _this.domain, nodeid: node.uuid };
      $.ajax({
        data: data,
        type: "POST",
        //url: "/getrelationnodecount",
        url: _this.contextRoot + "/getrelationnodecount",
        success: function(result) {
          if (result.code == 200) {
            _this.selectnode.name = node.name;
            _this.selectnode.count = result.data;
          }
        }
      });
    },
    btnaddsingle() {
      d3.select(".graphcontainer").style("cursor", "crosshair"); //进入新增模式，鼠标变成＋
    },
    btndeletelink() {
      this.isdeletelink = true;
      d3.select(".link").attr("class", "link linkdelete"); // 修改鼠标样式为"+"
    },
    getmorenode(selectid) {
      var _this = this;
      //var data = { domain: _this.domain, nodeid: _this.selectnodeid };
      var data = { id: selectid };
      $.ajax({
        data: JSON.stringify(data),
        type: "POST",
        //url: "/getmorerelationnode",
        url: _this.contextRoot + "/restapi/v1/node/next/level/show",
        contentType: 'application/json',
        success: function(result) {
          if (result.code == 200) {
            var newnodes = result.data.node || [];
            var newships = result.data.relationship || [];
            var oldnodescount = _this.graph.nodes.length;
            newnodes.forEach(function(m) {
              var sobj = _this.graph.nodes.find(function(x) {
                return x.uuid === m.uuid;
              });
              if (typeof sobj == "undefined") {
                _this.graph.nodes.push(m);
                if (!_this.findNode(m.id)) {
                  _this.nodeMap[m.id] = m;
                  _this.expandedNodeMap[selectid] = _this.expandedNodeMap[selectid] ? _this.expandedNodeMap[selectid].concat([m.id]) : [m.id];
                }
              }
            });
            var newnodescount = _this.graph.nodes.length;
            if (newnodescount <= oldnodescount) {
              _this.$message({
                message: "没有更多节点信息",
                type: "success"
              });
              return;
            }
            newships.forEach(function(m) {
              var sobj = _this.graph.links.find(function(x) {
                return x.uuid === m.uuid;
              });
              if (typeof sobj == "undefined") {
                _this.graph.links.push(m);
                if(!_this.findRelationShipNode(m.relationId)) {
                  _this.relationshipMap[m.relationId] = m;
                }
              }
            });
            _this.updategraph();
          }
        },
        error: function(data) {}
      });
    },
    findNode (id) {
      return this.nodeMap[id];
    },
    findRelationShipNode (relationId) {
      return this.relationshipMap[relationId];
    },
    btnaddsame() {
      this.operatetype = 1;
      this.isbatchcreate = true;
      this.isedit = false;
    },
    btnquickaddnode() {
      this.isedit = false;
      this.isbatchcreate = true;
      $("#link_menubar").hide();
      this.operatetype = 3;
    },
    rightAddNodeHandle() {
      this.isedit = false;
      $("#link_menubar").hide();
      this.isRightAddNode = true;
    },
    deletedomain(id, value) {
      var _this = this;
      _this
        .$confirm(
          "此操作将删除该标签及其下节点和关系(不可恢复), 是否继续?",
          "三思而后行",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
        .then(function(res) {
          var data = { domainid: id, domain: value };
          $.ajax({
            data: data,
            type: "POST",
            //url: "/deletedomain",
            url: _this.contextRoot + "/deletedomain",
            success: function(result) {
              if (result.code == 200) {
                _this.getlabels();
                _this.domain = "";
              } else {
                _this.$message({
                  showClose: true,
                  message: result.msg,
                  type: "warning"
                });
              }
            }
          });
        })
        .catch(function() {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    createdomain(value) {
      var _this = this;
      _this
        .$prompt("请输入领域名称", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        })
        .then(function(res) {
          value = res.value;
          var data = { domain: value };
          $.ajax({
            data: data,
            type: "POST",
            //url: "/createdomain",
            url: _this.contextRoot + "/createdomain",
            success: function(result) {
              if (result.code == 200) {
                _this.getlabels();
                _this.domain = value;
                _this.getdomaingraph();
              } else {
                _this.$message({
                  showClose: true,
                  message: result.msg,
                  type: "warning"
                });
              }
            }
          });
        })
        .catch(function() {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    setGraphColors(data) {
      if (!data.nodeList || data.nodeList.length == 0) return;
      //this.fillColorList 支持10种颜色，超过10种使用 #008B8B
      let fillColors = this.fillColorList;
      this.colorModels = data.nodeList.map((item, index) => {
        let color = fillColors[index] ? fillColors[index] : "#008B8B";
        return Object.assign({}, item, { color });
      });
    },
    getlabels() {
      var _this = this;
      var data = {};
      $.ajax({
        data: data,
        type: "POST",
        url: _this.contextRoot + "/getgraph",
        success: function(result) {
          if (result.code == 200) {
            //_this.domainlabels=result.data;
            _this.pageModel = result.data;
            _this.setGraphColors(result.data);
            _this.pageModel.totalPage =
              parseInt((result.data.totalCount - 1) / result.data.pageSize) + 1;
          }
        }
      });
    },
    getmoredomain() {
      var _this = this;
      _this.pageModel.pageIndex = _this.pageModel.pageIndex + 1;
      var data = { pageIndex: _this.pageModel.pageIndex };
      $.ajax({
        data: data,
        type: "POST",
        //url: "/getgraph",
        url: _this.contextRoot + "/getgraph",
        success: function(result) {
          if (result.code == 200) {
            _this.pageModel.nodeList.push.apply(
              _this.pageModel.nodeList,
              result.data.nodeList
            );
            //_this.pageModel.nodeList.concat(result.data.nodeList);
          }
        }
      });
    },
    initgraph() {
      var graphcontainer = d3.select(".graphcontainer");
      var width = graphcontainer._groups[0][0].offsetWidth;
      //var height = window.screen.height - 154; //
      var height = window.screen.height - 125; //减去header和search栏高度
      this.svg = graphcontainer.append("svg");
      this.svg.attr("width", width);
      this.svg.attr("height", height);

      this.simulation = d3.forceSimulation()
        .force("link",d3.forceLink()
            //.distance(function(d) {
              //return Math.floor(Math.random() * 188) + 80;
            //})
            .id(function(d) {
              return d.uuid;
            })
        )
        // 万有引力
        .force("charge",d3.forceManyBody().strength(-40).distanceMax(600))
        // 碰撞作用力，为节点指定一个radius区域来防止节点重叠，设置碰撞力的强度，范围[0,1], 默认为0.7。设置迭代次数，默认为1，迭代次数越多最终的布局效果越好，但是计算复杂度更高
        .force("collide", d3.forceCollide(60).strength(0.2).iterations(5))
        // d3.forceCenter()用指定的x坐标和y坐标创建一个新的居中力
        .force("center", d3.forceCenter(width / 2, (height - 200) / 2))
        // 控制力学模拟衰减率，[0-1] ,设为0则不停止 ， 默认0.0228，直到0.001
        .alphaDecay(0.0228);
      
      this.linkGroup = this.svg.append("g").attr("class", "line");
      this.linktextGroup = this.svg.append("g").attr("class", "linetext");
      this.nodeGroup = this.svg.append("g").attr("class", "node");
      this.nodetextGroup = this.svg.append("g").attr("class", "nodetext");
      this.nodesymbolGroup = this.svg.append("g").attr("class", "nodesymbol");
      this.nodebuttonGroup = this.svg.append("g").attr("class", "nodebutton");
      this.addmaker();
      this.tooltip = this.svg.append("div").style("opacity", 0);
      this.svg.on(
        "click",
        function() {
          d3.selectAll(".buttongroup").classed("circle_opreate", true);
        },
        "false"
      );
    },
    setAttrModels(id) {
      //this.originalNodesData 原始数据
      this.newAttrFormModel = [];
      let jsonObj = this.originalNodesData.find(item => item.id == id);
      if(jsonObj) {
        for (let keys in jsonObj) {
          this.newAttrFormModel.push({
            key: keys,
            value: jsonObj[keys]
          });
        }
      }
    },
    updategraph() {
      var _this = this;
      var lks = this.graph.links;
      var nodes = this.graph.nodes;
      var links = [];
      //由后端传过来的节点坐标，固定节点，由于是字符串，需要转换
      // nodes.forEach(function(n) {
      //   if (typeof n.fx == "undefined" || n.fx == "" || n.fx == null) {
      //     n.fx = null;
      //   }
      //   if (typeof n.fy == "undefined" || n.fy == "" || n.fy == null) {
      //     n.fy = null;
      //   }
      //   if (typeof n.fx == "string") n.fx = parseFloat(n.fx);
      //   if (typeof n.fy == "string") n.fy = parseFloat(n.fy);
      // });
      lks.forEach(function(m) {
        var sourceNode = nodes.filter(function(n) {
          return n.uuid === m.sourceid;
        })[0];
        if (typeof sourceNode == "undefined") return;
        var targetNode = nodes.filter(function(n) {
          return n.uuid === m.targetid;
        })[0];
        if (typeof targetNode == "undefined") return;
        links.push({ source: sourceNode.uuid, target: targetNode.uuid, lk: m });
      });
      //为每一个节点定制按钮组
      _this.addnodebutton();
      if (links.length > 0) {
        _.each(links, function(link) {
          var same = _.where(links, {
            source: link.source,
            target: link.target
          });
          var sameAlt = _.where(links, {
            source: link.target,
            target: link.source
          });
          var sameAll = same.concat(sameAlt);
          _.each(sameAll, function(s, i) {
            s.sameIndex = i + 1;
            s.sameTotal = sameAll.length;
            s.sameTotalHalf = s.sameTotal / 2;
            s.sameUneven = s.sameTotal % 2 !== 0;
            s.sameMiddleLink =
              s.sameUneven === true &&
              Math.ceil(s.sameTotalHalf) === s.sameIndex;
            s.sameLowerHalf = s.sameIndex <= s.sameTotalHalf;
            s.sameArcDirection = 1;
            //s.sameArcDirection = s.sameLowerHalf ? 0 : 1;
            s.sameIndexCorrected = s.sameLowerHalf
              ? s.sameIndex
              : s.sameIndex - Math.ceil(s.sameTotalHalf);
          });
        });
        var maxSame = _.chain(links)
          .sortBy(function(x) {
            return x.sameTotal;
          })
          .last()
          .value().sameTotal;

        _.each(links, function(link) {
          link.maxSameHalf = Math.round(maxSame / 2);
        });
      }
      // 更新连线 links
      var link = _this.linkGroup
        .selectAll(".line >path")
        .data(links, function(d) {
          return d.uuid;
        });
      link.exit().remove();
      var linkEnter = _this.drawlink(link);
      link = linkEnter.merge(link);
      // 更新连线文字
      _this.linktextGroup
        .selectAll("text")
        .data(links, function(d) {
          return d.uuid;
        })
        .exit()
        .remove(); //移除多余的text dom
      var linktext = _this.linktextGroup
        .selectAll("text >textPath")
        .data(links, function(d) {
          return d.uuid;
        });
      linktext.exit().remove();
      var linktextEnter = _this.drawlinktext(linktext);
      linktext = linktextEnter.merge(linktext).text(function(d) {
        //return d.lk.name;
        return d.lk.relation;
      });
      // 更新节点按钮组
      d3.selectAll(".nodebutton >g").remove();
      var nodebutton = _this.nodebuttonGroup
        .selectAll(".nodebutton")
        .data(nodes, function(d) {
          return d;
        });
      nodebutton.exit().remove();
      var nodebuttonEnter = _this.drawnodebutton(nodebutton);
      nodebutton = nodebuttonEnter.merge(nodebutton);
      // 更新节点
      var node = _this.nodeGroup.selectAll("circle").data(nodes, function(d) {
        return d.uuid;
      });
      node.exit().remove();
      var nodeEnter = _this.drawnode(node);
      node = nodeEnter.merge(node).text(function(d) {
        return d.name;
      });
      // 更新节点文字
      var nodetext = _this.nodetextGroup
        .selectAll("text")
        .data(nodes, function(d) {
          return d.uuid;
        });
      nodetext.exit().remove();
      var nodetextEnter = _this.drawnodetext(nodetext);
      nodetext = nodetextEnter.merge(nodetext).text(function(d) {
        //return d.name;
        if (typeof d.name == "undefined") return "";
        let textLength = d.name.length;
        if (textLength > 4) {
          var s = d.name.slice(0, 4) + "...";
          return s;
        }
        return d.name;
      });
      nodetext
        .append("title") // 为每个节点设置title
        .text(function(d) {
          return d.name;
        });
      // 更新节点标识
      var nodesymbol = _this.nodesymbolGroup
        .selectAll("path")
        .data(nodes, function(d) {
          return d.uuid;
        });
      nodesymbol.exit().remove();
      var nodesymbolEnter = _this.drawnodesymbol(nodesymbol);
      nodesymbol = nodesymbolEnter.merge(nodesymbol);
      nodesymbol.attr("fill", "#e15500");
      nodesymbol.attr("display", function(d) {
        if (typeof d.hasfile != "undefined" && d.hasfile > 0) {
          return "block";
        }
        return "none";
      });
      _this.simulation.nodes(nodes).on("tick", ticked);
      _this.simulation.force("link").links(links);
     // _this.simulation.alphaTarget(0.01).restart();
      _this.simulation.alpha(0.5).restart();
      function linkArc(d) {
        var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy),
          unevenCorrection = d.sameUneven ? 0 : 0.5;
        var curvature = 2,
          arc =
            (1.0 / curvature) *
            ((dr * d.maxSameHalf) / (d.sameIndexCorrected - unevenCorrection));
        if (d.sameMiddleLink) {
          arc = 0;
        }
        var dd =
          "M" +
          d.source.x +
          "," +
          d.source.y +
          "A" +
          arc +
          "," +
          arc +
          " 0 0," +
          d.sameArcDirection +
          " " +
          d.target.x +
          "," +
          d.target.y;
        return dd;
      }

      function ticked() {
        link.attr("d", linkArc);
        // 更新节点坐标
        node
          .attr("cx", function(d) {
            return d.x;
          })
          .attr("cy", function(d) {
            return d.y;
          });
        // 更新节点操作按钮组坐标
        nodebutton
          .attr("cx", function(d) {
            return d.x;
          })
          .attr("cy", function(d) {
            return d.y;
          });
        nodebutton.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ") scale(1)";
        });

        // 更新文字坐标
        nodetext
          .attr("x", function(d) {
            return d.x;
          })
          .attr("y", function(d) {
            return d.y;
          });
        // 更新回形针坐标
        nodesymbol.attr("transform", function(d) {
          return (
            "translate(" + (d.x + 8) + "," + (d.y - 30) + ") scale(0.015,0.015)"
          );
        });
      }
      // 鼠标滚轮缩放
      //_this.svg.call(d3.zoom().transform, d3.zoomIdentity);//缩放至初始倍数
      _this.svg.call(
        d3.zoom().on("zoom", () => {
          d3.select("#link_menubar").style("display", "none");
          d3.select("#nodedetail").style("display", "none");
          d3.selectAll(".node").attr("transform", d3.event.transform);
          d3.selectAll(".nodetext").attr("transform", d3.event.transform);
          d3.selectAll(".line").attr("transform", d3.event.transform);
          d3.selectAll(".linetext").attr("transform", d3.event.transform);
          d3.selectAll(".nodesymbol").attr("transform", d3.event.transform);
          d3.selectAll(".nodebutton").attr("transform", d3.event.transform);
          //_this.svg.selectAll("g").attr("transform", d3.event.transform);
        })
      );
      _this.svg.on("dblclick.zoom", null); // 静止双击缩放
      //按钮组事件
      _this.svg.selectAll(".buttongroup").on("click", function(d, i) {
        if (_this.nodebuttonAction) {
          switch (_this.nodebuttonAction) {
            case "EDIT":
              _this.isedit = true;
              _this.propactiveName = "propedit";
              _this.txx = d.x;
              _this.tyy = d.y;
              break;
            case "MORE":
              _this.nodeFoldClicked(d);
              //_this.getmorenode(d.id);
              break;
            case "CHILD":
              _this.operatetype = 2;
              _this.isbatchcreate = true;
              _this.isedit = false;
              break;
            case "ATTR":
              _this.setAttrModels(d.id);
              _this.isATTRcreate = true;
              _this.isedit = false;
              break;
            case "LINK":
              _this.isaddlink = true;
              _this.selectstartuuid = d.uuid;
              _this.selectsourcenodeid = d.id;
              break;
            case "DELETE":
              //_this.selectnodeid = d.uuid;
              _this.selectnodeid = d.id;
              var out_buttongroup_id = ".out_buttongroup_" + i;
              _this.deletenode(out_buttongroup_id, d.labelName);
              break;
          }
          _this.nodebuttonAction = "";
          //ACTION = ""; //重置 ACTION
        }
      });
      //按钮组事件绑定
      _this.svg.selectAll(".action_0").on("click", function(d) {
        _this.nodebuttonAction = "EDIT";
      });
      _this.svg.selectAll(".action_1").on("click", function(d) {
        _this.nodebuttonAction = "MORE";
      });
      _this.svg.selectAll(".action_2").on("click", function(d) {
        //_this.nodebuttonAction = "CHILD";
        _this.nodebuttonAction = "ATTR";
      });
      _this.svg.selectAll(".action_3").on("click", function(d) {
        _this.nodebuttonAction = "LINK";
      });
      _this.svg.selectAll(".action_4").on("click", function(d) {
        _this.nodebuttonAction = "DELETE";
      });
    },
    nodeFoldClicked(d) {
      if (d.expanded) {
        this.nodeCollapse(d);
        return
      }
      d.expanded = true;
      let obj = this.graph.nodes.find(item => item.id == d.id);
      if(obj) {
        obj.expanded = true;
      }

      this.getmorenode(d.id);
    },
    nodeCollapse(d) {
      d.expanded = false;
      let obj = this.graph.nodes.find(item => item.id == d.id);
      if(obj) {
        obj.expanded = false;
      }
      this.collapseNode(d);
    },
    //折叠
    collapseNode(node) {
      if (!this.expandedNodeMap[node.id]) {
        return
      }
      this.expandedNodeMap[node.id].forEach(id => {
        const eNode = this.nodeMap[id];
        this.collapseNode(eNode);
        this.removeConnectedRelationships(eNode);
        this.removeNode(eNode);
      });
      this.expandedNodeMap[node.id] = [];
      this.updategraph();
      //this.addnodebutton();
    },
    removeConnectedRelationships (node) {
      for (let r of Array.from(this.findAllRelationshipToNode(node))) {
        if(this.findRelationShipNode(r.relationId)) {
          //返回数组索引
          let index = this.graph.links.findIndex(item => item.relationId == r.relationId);
          this.graph.links.splice(index, 1);
          delete this.relationshipMap[r.relationId];
        }
      }
      return this;
    },
    removeNode (node) {
      if (this.findNode(node.id)) {
        //返回数组索引
        let index = this.graph.nodes.findIndex(item => item.id == node.id);
        this.graph.nodes.splice(index, 1);
        delete this.nodeMap[node.id];
      }
      return this;
    },
    //找到和展开节点所有有关系的信息
    findAllRelationshipToNode (node) {
      return this.graph.links.filter(
        relationship =>
          relationship.sourceid === node.uuid || relationship.targetid === node.uuid
      )
    },
    createnode() {
      var _this = this;
      var data = _this.graphEntity;
      //data.domain = _this.domain;
      let datas = {
        id: data.id,
        name: data.name,
        labelName: data.labelName
      };
      $.ajax({
        data: JSON.stringify(datas),
        type: "POST",
        contentType: "application/json",
        traditional: true,
        //url: "/createnode",
        url: _this.contextRoot + "/createnode",
        success: function(result) {
          if (result.code == 200) {
            if (_this.graphEntity.uuid != 0) {
              for (var i = 0; i < _this.graph.nodes.length; i++) {
                if (_this.graph.nodes[i].uuid == _this.graphEntity.uuid) {
                  _this.graph.nodes.splice(i, 1);
                }
              }
            }
            var newnode = result.data;
            newnode.x = _this.txx;
            newnode.y = _this.tyy;
            newnode.fx = _this.txx;
            newnode.fy = _this.tyy;
            _this.graph.nodes.push(newnode);
            _this.resetentity();
            _this.updategraph();
            _this.isedit = false;
            _this.resetsubmit();
          }
        }
      });
    },
    createSingleNode() {
      var _this = this;
      var data = { name: "", r: 30 };
      data.domain = _this.domain;
      $.ajax({
        data: data,
        type: "POST",
        traditional: true,
        //url: "/createnode",
        url: _this.contextRoot + "/createnode",
        success: function(result) {
          if (result.code == 200) {
            d3.select(".graphcontainer").style("cursor", "");
            var newnode = result.data;
            newnode.x = _this.txx;
            newnode.y = _this.tyy;
            newnode.fx = _this.txx;
            newnode.fy = _this.tyy;
            _this.graph.nodes.push(newnode);
            _this.updategraph();
          }
        }
      });
    },
    addmaker() {
      var arrowMarker = this.svg
        .append("marker")
        .attr("id", "arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "20") //
        .attr("markerHeight", "20")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", "22") // 13
        .attr("refY", "0")
        .attr("orient", "auto");
      var arrow_path = "M0,-5L10,0L0,5"; // 定义箭头形状
      arrowMarker
        .append("path")
        .attr("d", arrow_path)
        //.attr("fill", "#fce6d4");
        .attr("fill", "#a5abb6");
    },
    setFillColor(labelName) {
      let colorModels = this.colorModels;
      let obj = colorModels.find(item => item.name == labelName);
      if (obj) {
        return obj.color;
      } else {
        return "#008B8B";
      }
    },
    setStrokeColor(labelName) {
      switch (labelName) {
        case "科室":
          return "#ff4500";
        case "病史":
          return "#4c8eda";
        case "家族史":
          return "#ffc454";
        case "症状":
          return "#eb2728";
        case "伴随症状":
          return "#c0a378";
        case "疾病":
          return "#5db665";
        default:
          return "#ff4500";
      }
    },
    addnodebutton(r) {
      //先删除所有为节点自定义的按钮组
      d3.selectAll("svg >defs").remove();
      var nodes = this.graph.nodes;
      var database = [1, 1, 1, 1, 1];
      var pie = d3.pie();
      var piedata = pie(database);
      var nodebutton = this.svg.append("defs");
      nodes.forEach(function(m) {
        var nbtng = nodebutton.append("g").attr("id", "out_circle" + m.uuid); //为每一个节点定制一个按钮组，在画按钮组的时候为其指定该id
        var buttonEnter = nbtng
          .selectAll(".buttongroup")
          .data(piedata)
          .enter()
          .append("g")
          .attr("class", function(d, i) {
            return "action_" + i;
          });
        var defaultR = 30;
        if (typeof m.r == "undefined") {
          m.r = defaultR;
        }
        var arc = d3
          .arc()
          .innerRadius(m.r)
          .outerRadius(m.r + 30);
        buttonEnter
          .append("path")
          .attr("d", function(d) {
            return arc(d);
          })
          .attr("fill", "#D2D5DA")
          .style("opacity", 0.9)
          .attr("stroke", "#f0f0f4")
          .attr("stroke-width", 2);
        buttonEnter
          .append("text")
          .attr("transform", function(d, i) {
            return "translate(" + arc.centroid(d) + ")";
          })
          .attr("text-anchor", "middle")
          .text(function(d, i) {
            var zi = new Array();
            zi[0] = "编辑";
            //zi[1] = d.expanded ? "折叠" : "展开/折叠";
            zi[1] = d.expanded ? "折叠" : "收/展";
            // zi[2] = "追加";
            zi[2] = "属性";
            zi[3] = "连线";
            zi[4] = "删除";
            return zi[i];
          })
          .attr("font-size", 10);
      });
    },
    dragstarted(d) {
      if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
      d.fixed = true;
    },
    dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    },
    dragended(d) {
      if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = d3.event.x;
      d.fy = d3.event.y;
      var domain = this.domain;
      var uuid = d.uuid;
      var fx = d.fx;
      var fy = d.fy;
      var ajaxdata = { domain: domain, uuid: uuid, fx: fx, fy: fy };
      var _this = this;
      // $.ajax({
      //   data: ajaxdata,
      //   type: "POST",
      //   //url: "/updateCorrdOfNode",
      //   url: _this.contextRoot + "/updateCorrdOfNode",
      //   success: function(result) {
      //     if (result.code == 200) {
      //     }
      //   },
      //   error: function(XMLHttpRequest, textStatus, errorThrown) {
      //     alert(errorThrown);
      //   }
      // });
    },
    drawnode(node) {
      var _this = this;
      var nodeEnter = node.enter().append("circle");
      nodeEnter.attr("r", function(d) {
        if (typeof d.r != "undefined" && d.r != "") {
          return d.r;
        }
        return 30;
      });
      nodeEnter.attr("fill", function(d) {
        if (typeof d.color != "undefined" && d.color != "") {
          return d.color;
        }
        return _this.setFillColor(d.labelName);
        //return "#ff4500";
      });
      nodeEnter.style("opacity", 1);
      nodeEnter.style("stroke", function(d) {
        if (typeof d.color != "undefined" && d.color != "") {
          return d.color;
        }
        //return _this.setStrokeColor(d.labelName);
        return _this.setFillColor(d.labelName);
        //return "#ff4500";
      });
      nodeEnter.style("stroke-opacity", 1);
      nodeEnter
        .append("title") // 为每个节点设置title
        .text(function(d) {
          return d.name;
        });
      nodeEnter.on("mouseover", function(d, i) {
        _this.nodedetail = d;
        _this.timer = setTimeout(function() {
          d3.select("#richContainer")
            .style("position", "absolute")
            .style("left", d.x + "px")
            .style("top", d.y + "px")
            .style("display", "block");
          _this.editorcontent = "";
          _this.showImageList = [];
          //_this.getNodeDetail(d.uuid);
        }, 1000);
      });
      nodeEnter.on("mouseout", function(d, i) {
        clearTimeout(_this.timer);
      });
      nodeEnter.on("dblclick", function(d) {
        _this.updatenodename(d); // 双击更新节点名称
      });
      nodeEnter.on("mouseenter", function(d) {
        var aa = d3.select(this)._groups[0][0];
        if (aa.classList.contains("selected")) return;
        d3.select(this).style("stroke-width", "6");
      });
      nodeEnter.on("mouseleave", function(d) {
        var aa = d3.select(this)._groups[0][0];
        if (aa.classList.contains("selected")) return;
        d3.select(this).style("stroke-width", "2");
      });
      nodeEnter.on("click", function(d, i) {
        $("#link_menubar").hide(); // 隐藏空白处右键菜单(连线)
        $("#blank_menubar").hide(); // 隐藏空白处右键菜单
        d3.select("#nodedetail").style("display", "block");
        var out_buttongroup_id = ".out_buttongroup_" + i;
        _this.svg.selectAll(".buttongroup").classed("circle_opreate", true);
        _this.svg
          .selectAll(out_buttongroup_id)
          .classed("circle_opreate", false);
        _this.graphEntity = d;
        _this.selectnodeid = d.uuid;
        _this.selectnodename = d.name;
        // 添加连线状态
        if (_this.isaddlink) {
          _this.selectenduuid = d.uuid;
          _this.selecttargetnodeid = d.id;
          if (
            _this.selectsourcenodeid == _this.selecttargetnodeid ||
            _this.selectsourcenodeid == 0 ||
            _this.selecttargetnodeid == 0
          )
            return;
          _this.createlink(
            _this.selectsourcenodeid,
            _this.selecttargetnodeid,
            _this.selectstartuuid,
            _this.selectenduuid
          );
          _this.selectsourcenodeid = 0;
          _this.selecttargetnodeid = 0;
          _this.selectstartuuid = 0;
          _this.selectenduuid = 0;
          d.fixed = false;
          d3.event.stopPropagation();
        }
      });
      nodeEnter.call(
        d3
          .drag()
          .on("start", _this.dragstarted)
          .on("drag", _this.dragged)
          .on("end", _this.dragended)
      );
      return nodeEnter;
    },
    drawnodetext(nodetext) {
      var _this = this;
      var nodetextenter = nodetext
        .enter()
        .append("text")
        .style("fill", "#fff")
        .attr("dy", 4)
        .attr("font-family", "微软雅黑")
        .attr("font-size", 12) //字体大小
        .attr("text-anchor", "middle")
        .text(function(d) {
          if (typeof d.name == "undefined") return "";
          var length = d.name.length;
          if (d.name.length > 4) {
            var s = d.name.slice(0, 4) + "...";
            return s;
          }
          return d.name;
        });
      nodetextenter.on("mouseover", function(d, i) {
        _this.timer = setTimeout(function() {
          d3.select("#richContainer")
            .style("position", "absolute")
            .style("left", d.x + "px")
            .style("top", d.y + "px")
            .style("display", "block");
          _this.editorcontent = "";
          _this.showImageList = [];
          //_this.getNodeDetail(d.uuid);
        }, 3000);
      });

      nodetextenter.on("dblclick", function(d) {
        _this.updatenodename(d); // 双击更新节点名称
      });
      nodetextenter.on("click", function(d) {
        $("#link_menubar").hide(); // 隐藏空白处右键菜单(连线)
        $("#blank_menubar").hide(); // 隐藏空白处右键菜单
        _this.graphEntity = d;
        _this.selectnodeid = d.uuid;
        // 更新工具栏节点信息
        //_this.getcurrentnodeinfo(d);
        // 添加连线状态
        if (_this.isaddlink) {
          _this.selectenduuid = d.uuid;
          _this.selecttargetnodeid = d.id;
          if (
            _this.selectsourcenodeid == _this.selecttargetnodeid ||
            _this.selectsourcenodeid == 0 ||
            _this.selecttargetnodeid == 0
          )
            return;
          _this.createlink(
            _this.selectsourcenodeid,
            _this.selecttargetnodeid,
            _this.selectstartuuid,
            _this.selectenduuid
          );
          _this.selectsourcenodeid = 0;
          _this.selecttargetnodeid = 0;
          _this.selectstartuuid = 0;
          _this.selectenduuid = 0;
          d.fixed = false;
          d3.event.stopPropagation();
        }
      });

      return nodetextenter;
    },
    drawnodesymbol(nodesymbol) {
      var _this = this;
      var symnol_path =
        "M566.92736 550.580907c30.907733-34.655573 25.862827-82.445653 25.862827-104.239787 0-108.086613-87.620267-195.805867-195.577173-195.805867-49.015467 0-93.310293 18.752853-127.68256 48.564907l-0.518827-0.484693-4.980053 4.97664c-1.744213 1.64864-3.91168 2.942293-5.59104 4.72064l0.515413 0.484693-134.69696 133.727573L216.439467 534.8352l0 0 137.478827-136.31488c11.605333-10.410667 26.514773-17.298773 43.165013-17.298773 36.051627 0 65.184427 29.197653 65.184427 65.24928 0 14.032213-5.33504 26.125653-12.73856 36.829867l-131.754667 132.594347 0.515413 0.518827c-10.31168 11.578027-17.07008 26.381653-17.07008 43.066027 0 36.082347 29.16352 65.245867 65.184427 65.245867 16.684373 0 31.460693-6.724267 43.035307-17.07008l0.515413 0.512M1010.336427 343.49056c0-180.25472-145.882453-326.331733-325.911893-326.331733-80.704853 0-153.77408 30.22848-210.418347 79.0528l0.484693 0.64512c-12.352853 11.834027-20.241067 28.388693-20.241067 46.916267 0 36.051627 29.16352 65.245867 65.211733 65.245867 15.909547 0 29.876907-6.36928 41.192107-15.844693l0.38912 0.259413c33.624747-28.030293 76.301653-45.58848 123.511467-45.58848 107.99104 0 195.549867 87.6544 195.549867 195.744427 0 59.815253-27.357867 112.71168-69.51936 148.503893l0 0-319.25248 317.928107 0 0c-35.826347 42.2912-88.654507 69.710507-148.340053 69.710507-107.956907 0-195.549867-87.68512-195.549867-195.805867 0-59.753813 27.385173-112.646827 69.515947-148.43904l-92.18048-92.310187c-65.69984 59.559253-107.700907 144.913067-107.700907 240.749227 0 180.28544 145.885867 326.301013 325.915307 326.301013 95.218347 0 180.02944-41.642667 239.581867-106.827093l0.13312 0.129707 321.061547-319.962453-0.126293-0.13312C968.69376 523.615573 1010.336427 438.71232 1010.336427 343.49056L1010.336427 343.49056 1010.336427 343.49056zM1010.336427 343.49056"; // 定义回形针形状
      var nodesymbolEnter = nodesymbol
        .enter()
        .append("path")
        .attr("d", symnol_path);
      nodesymbolEnter.call(
        d3
          .drag()
          .on("start", _this.dragstarted)
          .on("drag", _this.dragged)
          .on("end", _this.dragended)
      );
      return nodesymbolEnter;
    },
    drawnodebutton(nodebutton) {
      var _this = this;
      var nodebuttonEnter = nodebutton
        .enter()
        .append("g")
        .append("use") //  为每个节点组添加一个 use 子元素
        .attr("r", function(d) {
          return d.r;
        })
        .attr("xlink:href", function(d) {
          return "#out_circle" + d.uuid;
        }) //  指定 use 引用的内容
        .attr("class", function(d, i) {
          return "buttongroup out_buttongroup_" + i;
        })
        .classed("circle_opreate", true);

      return nodebuttonEnter;
    },
    drawlink(link) {
      var _this = this;
      var linkEnter = link
        .enter()
        .append("path")
        .attr("stroke-width", 1)
        //.attr("stroke", "#fce6d4")
        .attr("stroke", "#a5abb6")
        .attr("fill", "none")
        .attr("id", function(d) {
          return (
            "invis_" + d.lk.sourceid + "-" + d.lk.name + "-" + d.lk.targetid
          );
        })
        .attr("marker-end", "url(#arrow)"); // 箭头
      linkEnter.on("dblclick", function(d) {
        //_this.selectnodeid = d.lk.uuid;
        _this.selectnodeid = d.lk.relationId;
        if (_this.isdeletelink) {
          _this.deletelink();
        } else {
          _this.updatelinkName();
        }
      });
      linkEnter.on("contextmenu", function(d) {
        var cc = $(this).offset();
        //app.selectnodeid = d.lk.uuid;
        _this.selectnodeid = d.lk.relationId;
        _this.selectlinkname = d.lk.name;
        d3.select("#link_menubar")
          .style("position", "fixed")
          .style("left", cc.left + "px")
          .style("top", cc.top + "px")
          .style("display", "block");
        d3.event.preventDefault(); // 禁止系统默认右键
        d3.event.stopPropagation(); // 禁止空白处右键
      });
      linkEnter.on("mouseenter", function(d) {
        d3.select(this)
          .style("stroke-width", "4")
          .attr("stroke", "#ff9e9e")
          .attr("marker-end", "url(#arrow)");
        _this.nodedetail = d.lk;
        d3.select("#nodedetail").style("display", "block");
      });
      linkEnter.on("mouseleave", function(d) {
        d3.select(this)
          .style("stroke-width", "1")
          //.attr("stroke", "#fce6d4")
          .attr("stroke", "#a5abb6")
          .attr("marker-end", "url(#arrow)");
      });
      return linkEnter;
    },
    drawlinktext(link) {
      var linktextEnter = link
        .enter()
        .append("text")
        //.style("fill", "#e3af85")
        .style("fill", "#333")
        .append("textPath")
        .attr("startOffset", "50%")
        .attr("text-anchor", "middle")
        .attr("xlink:href", function(d) {
          return (
            "#invis_" + d.lk.sourceid + "-" + d.lk.name + "-" + d.lk.targetid
          );
        })
        .style("font-size", 12)
        .text(function(d) {
          // if (d.lk.name != "") {
          //   return d.lk.name;
          // }
          if (d.lk.relation != "") {
            return d.lk.relation;
          }
        });
      //暂时先注释，hover连线展示弹窗
      // linktextEnter.on("mouseover", function(d) {
      //   app.selectnodeid = d.lk.uuid;
      //   app.selectlinkname = d.lk.name;
      //   var cc = $(this).offset();
      //   d3.select("#link_menubar")
      //     .style("position", "absolute")
      //     .style("left", cc.left + "px")
      //     .style("top", cc.top + "px")
      //     .style("display", "block");
      // });

      return linktextEnter;
    },
    deletenode(out_buttongroup_id, labelName) {
      var _this = this;
      _this
        .$confirm(
          "此操作将删除该节点及周边关系(不可恢复), 是否继续?",
          "三思而后行",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        )
        .then(function() {
          //var data = { domain: _this.domain, nodeid: _this.selectnodeid };
          var data = { id: _this.selectnodeid, labelName };
          $.ajax({
            data: JSON.stringify(data),
            type: "POST",
            contentType: "application/json",
            //url: "/deletenode",
            url: _this.contextRoot + "/deletenode",
            success: function(result) {
              if (result.code == 200) {
                _this.svg.selectAll(out_buttongroup_id).remove();
                var rships = result.data;
                // 删除节点对应的关系
                for (var m = 0; m < rships.length; m++) {
                  for (var i = 0; i < _this.graph.links.length; i++) {
                    if (_this.graph.links[i].uuid == rships[m].uuid) {
                      _this.graph.links.splice(i, 1);
                      i = i - 1;
                    }
                  }
                }
                // 找到对应的节点索引
                var j = -1;
                for (var i = 0; i < _this.graph.nodes.length; i++) {
                  if (_this.graph.nodes[i].id == _this.selectnodeid) {
                    j = i;
                    break;
                  }
                }
                if (j >= 0) {
                  _this.selectnodeid = 0;
                  _this.graph.nodes.splice(i, 1); // 根据索引删除该节点
                  _this.updategraph();
                  _this.resetentity();
                  _this.$message({
                    type: "success",
                    message: "操作成功!"
                  });
                }
              }
            }
          });
        })
        .catch(function() {
          _this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    deletelink() {
      var _this = this;
      this.$confirm("此操作将删除该关系(不可恢复), 是否继续?", "三思而后行", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(function() {
          //var data = { domain: _this.domain, shipid: _this.selectnodeid };
          let data = { relationId: _this.selectnodeid };
          $.ajax({
            data: JSON.stringify(data),
            type: "POST",
            contentType: "application/json",
            //url: "/deletelink",
            url: _this.contextRoot + "/deletelink",
            success: function(result) {
              if (result.code == 200) {
                var j = -1;
                for (var i = 0; i < _this.graph.links.length; i++) {
                  if (_this.graph.links[i].relationId == _this.selectnodeid) {
                    j = i;
                    break;
                  }
                }
                if (j >= 0) {
                  _this.selectnodeid = 0;
                  _this.graph.links.splice(i, 1);
                  _this.updategraph();
                  _this.isdeletelink = false;
                  _this.$message({
                    type: "success",
                    message: "操作成功!"
                  });
                }
              }
            }
          });
        })
        .catch(function() {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    createlink(sourceId, targetId, startuuid, enduuid) {
      var _this = this;
      //this.selectlinkname = '';
      // var data = {
      //   domain: _this.domain,
      //   sourceid: sourceId,
      //   targetid: targetId,
      //   ship: ""
      // };
      _this
        .$prompt("请输入关系名称", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValue: this.selectlinkname
        })
        .then(function(res) {
          let value = res.value;
          var data = {
            startId: sourceId,
            endId: targetId,
            sourceid: startuuid,
            targetid: enduuid,
            relation: value
          };
          $.ajax({
            data: JSON.stringify(data),
            type: "POST",
            //url: "/create_link",
            url: _this.contextRoot + "/restapi/v1/relation/add",
            contentType: "application/json",
            success: function(result) {
              if (result.code == 200) {
                let newship = result.data;
                if (newship.relationId) {
                  _this.graph.links.push(newship);
                  _this.updategraph();
                } else {
                  _this.$message({
                    type: "info",
                    message: "无法创建关系"
                  });
                }
                _this.isaddlink = false;
              } else {
                _this.$message({
                  type: "info",
                  message: "无法创建关系"
                });
              }
            }
          });
        });
    },
    updatelinkName() {
      var _this = this;
      _this
        .$prompt("请输入关系名称", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValue: this.selectlinkname
        })
        .then(function(res) {
          let value = res.value;
          // var data = {
          //   domain: _this.domain,
          //   shipid: _this.selectnodeid,
          //   shipname: value
          // };
          let data = {
            relationId: _this.selectnodeid,
            relation: value
          };
          $.ajax({
            data: JSON.stringify(data),
            type: "POST",
            contentType: "application/json",
            //url: _this.contextRoot + "/updatelink",
            url: _this.contextRoot + "/restapi/v1/relation/update",
            success: function(result) {
              if (result.code == 200) {
                var newship = result.data;
                _this.graph.links.forEach(function(m) {
                  if (m.relationId == newship.relationId) {
                    m.relation = newship.relation;
                  }
                });
                _this.selectnodeid = 0;
                _this.updategraph();
                _this.isaddlink = false;
                _this.selectlinkname = "";
                _this.$message({
                  type: "success",
                  message: "操作成功"
                });
              }
            }
          });
        })
        .catch(function() {
          _this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    updatenodename(d) {
      var _this = this;
      _this
        .$prompt("编辑节点名称", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          inputValue: d.name
        })
        .then(function(res) {
          value = res.value;
          var data = { domain: _this.domain, nodeid: d.uuid, nodename: value };
          $.ajax({
            data: data,
            type: "POST",
            //url: "/updatenodename",
            url: _this.contextRoot + "/updatenodename",
            success: function(result) {
              if (result.code == 200) {
                if (d.uuid != 0) {
                  for (var i = 0; i < _this.graph.nodes.length; i++) {
                    if (_this.graph.nodes[i].uuid == d.uuid) {
                      _this.graph.nodes[i].name = value;
                    }
                  }
                }
                _this.updategraph();
                _this.$message({
                  message: "操作成功",
                  type: "success"
                });
              }
            }
          });
        })
        .catch(function() {
          _this.$message({
            type: "info",
            message: "取消操作"
          });
        });
    },
    resetsubmit() {
      this.isaddnode = false;
      this.isedit = false;
      this.resetentity();
      this.fieldDataList = [];
      this.dataconfigactive = "";
      this.isbatchcreate = false;
      this.selectnodeid = 0;
    },
    //属性编辑取消
    resetattrCancel() {
      this.isATTRcreate = false;
      this.newAttrFormModel = [];
    },
    resetentity() {
      this.graphEntity = {
        uuid: 0,
        color: "ff4500",
        name: "",
        r: 30,
        x: "",
        y: ""
      };
    },
    fillinform(d) {
      this.graphEntity = {
        uuid: d.uuid,
        name: d.name,
        color: d.color,
        r: d.r,
        x: d.x,
        y: d.y
      };
    },
    matchdomaingraph(domain, event) {
      this.domain = domain.name;
      this.domainid = domain.id;
      this.nodename = '';
      this.getdomaingraph();
      this.getNodeAttribute();
      this.getRelationAttribute();
    },
    getNodeAttribute() {
      let _this = this;
      let data = {};
      $.ajax({
        data: JSON.stringify(data),
        type: "POST",
        url: _this.contextRoot + "/restapi/v1/attribute/node/get",
        contentType: 'application/json',
        success: function(result) {
          if (result.code == 200) {
            _this.nodeAttributes = result.data;
            _this.nodeRelations = result.data;
          }
        }
      });
    },
    getRelationAttribute() {
      let _this = this;
      let data = {};
      $.ajax({
        data: JSON.stringify(data),
        type: "POST",
        url: _this.contextRoot + "/restapi/v1/attribute/relation/get",
        contentType: 'application/json',
        success: function(result) {
          if (result.code == 200) {
            _this.relationAttributes = result.data;
          }
        }
      });
    },
    refreshnode(event) {
      $(".ml-a").removeClass("cur");
      $(event.currentTarget).addClass("cur");
      this.nodename = "";
      this.getdomaingraph();
    },
    getFilterDomain(domainList) {
      var array = [];
      for (var i = 0; i < domainList.length; i++) {
        array.push({
          value: domainList[i].label.substring(
            1,
            domainList[i].label.length - 1
          )
        });
      }
      return array;
    },
    operateCommand(command) {
      if (command === "image") {
        this.exportimage();
      }
      if (command === "import") {
        this.dialogFormVisible = true;
      }
      if (command === "export") {
        this.exportFormVisible = true;
      }
    },
    exportcsv() {
      var _this = this;
      $.ajax({
        data: { domain: _this.uploadparam.domain },
        type: "POST",
        //url: "/exportgraph",
        url: _this.contextRoot + "/exportgraph",
        success: function(result) {
          if (result.code == 200) {
            _this.exportFormVisible = false;
            window.open(result.csvurl);
          }
        }
      });
    },
    submitUpload() {
      this.$refs.upload.submit();
      this.dialogFormVisible = false;
    },
    csvsuccess() {
      this.$refs.upload.clearFiles();
      this.uploadparam.domain = "";
      this.$message({
        message: "正在导入中,请稍后查看",
        type: "success"
      });
    },
    exportimage() {
      /*https://html2canvas.hertzen.com/getting-started  截图js*/
      html2canvas(document.querySelector(".graphcontainer")).then(function(
        canvas
      ) {
        var a = document.createElement("a");
        a.href = canvas.toDataURL("image/png"); //将画布内的信息导出为png图片数据
        var timestamp = Date.parse(new Date());
        a.download = timestamp; //设定下载名称
        a.click(); //点击触发下载
      });
    },
    setmatchsize(m, event) {
      for (var i = 0; i < this.pagesizelist.length; i++) {
        this.pagesizelist[i].isactive = false;
        if (this.pagesizelist[i].size == m.size) {
          this.pagesizelist[i].isactive = true;
        }
      }
      this.pagesize = m.size;
      this.getdomaingraph();
    },
    batchcreatenode() {
      var _this = this;
      var data = {
        domain: _this.domain,
        sourcename: _this.batchcreate.sourcenodename,
        targetnames: _this.batchcreate.targetnodenames,
        relation: _this.batchcreate.relation
      };
      $.ajax({
        data: data,
        type: "POST",
        //url: "/batchcreatenode",
        url: _this.contextRoot + "/batchcreatenode",
        success: function(result) {
          if (result.code == 200) {
            _this.isbatchcreate = false;
            var newnodes = result.data.nodes;
            var newships = result.data.ships;
            newnodes.forEach(function(m) {
              var sobj = _this.graph.nodes.find(function(x) {
                return x.uuid === m.uuid;
              });
              if (typeof sobj == "undefined") {
                _this.graph.nodes.push(m);
              }
            });
            newships.forEach(function(m) {
              var sobj = _this.graph.links.find(function(x) {
                return x.uuid === m.uuid;
              });
              if (typeof sobj == "undefined") {
                _this.graph.links.push(m);
              }
            });
            _this.updategraph();
            _this.batchcreate.sourcenodename = "";
            _this.batchcreate.targetnodenames = "";
            _this.$message({
              message: "操作成功",
              type: "success"
            });
          }
        }
      });
    },
    //属性编辑提交
    attrformSubmit() {
      let _this = this;
      let obj = {};
      this.newAttrFormModel.map(e => {
        if(e.key) {
          obj[e.key] = e.value;
        }
      });
      $.ajax({
        data: JSON.stringify(obj),
        type: "POST",
        contentType: 'application/json',
        url: _this.contextRoot + "/restapi/v1/attribute/node/put",
        success: function(result) {
          if (result.code == 200) {
            _this.isATTRcreate = false;
            let newnodeObj = result.data.exist;
            let removeArr = result.data.remove;
            _this.graph.nodes.forEach(item => {
              if(item.id == newnodeObj.id) {
                Object.assign(item, newnodeObj);
                removeArr.forEach(v => {
                  _this.$delete(item, v);
                });
              }
            });
            _this.originalNodesData.forEach(e => {
              if(e.id == newnodeObj.id) {
                Object.assign(e, newnodeObj);
                removeArr.forEach(v => {
                  _this.$delete(e, v);
                });
              }
            });
            _this.updategraph();
            _this.$message({
              message: "操作成功",
              type: "success"
            });
          }else {
            _this.$message({
              message: "保存失败",
              type: "info"
            });
          }
        }
      });

    },
    batchcreatechildnode() {
      var _this = this;
      var data = {
        domain: _this.domain,
        sourceid: _this.selectnodeid,
        targetnames: _this.batchcreate.targetnodenames,
        relation: _this.batchcreate.relation
      };
      $.ajax({
        data: data,
        type: "POST",
        //url: "/batchcreatechildnode",
        url: _this.contextRoot + "/batchcreatechildnode",
        success: function(result) {
          if (result.code == 200) {
            _this.isbatchcreate = false;
            var newnodes = result.data.nodes;
            var newships = result.data.ships;
            newnodes.forEach(function(m) {
              var sobj = _this.graph.nodes.find(function(x) {
                return x.uuid === m.uuid;
              });
              if (typeof sobj == "undefined") {
                _this.graph.nodes.push(m);
              }
            });
            newships.forEach(function(m) {
              var sobj = _this.graph.links.find(function(x) {
                return x.uuid === m.uuid;
              });
              if (typeof sobj == "undefined") {
                _this.graph.links.push(m);
              }
            });
            _this.updategraph();
            _this.batchcreate.sourcenodename = "";
            _this.batchcreate.targetnodenames = "";
            _this.$message({
              message: "操作成功",
              type: "success"
            });
          }
        }
      });
    },
    batchcreatesamenode() {
      var _this = this;
      var data = {
        domain: _this.domain,
        sourcenames: _this.batchcreate.sourcenodename
      };
      $.ajax({
        data: data,
        type: "POST",
        //url: "/batchcreatesamenode",
        url: _this.contextRoot + "/batchcreatesamenode",
        success: function(result) {
          if (result.code == 200) {
            _this.isbatchcreate = false;
            var newnodes = result.data;
            newnodes.forEach(function(m) {
              var sobj = _this.graph.nodes.find(function(x) {
                return x.uuid === m.uuid;
              });
              if (typeof sobj == "undefined") {
                _this.graph.nodes.push(m);
              }
            });
            _this.updategraph();
            _this.batchcreate.sourcenodename = "";
            _this.$message({
              message: "操作成功",
              type: "success"
            });
          }
        }
      });
    },
    //右键添加节点成功
    rightAddNodeSubmit() {
      var _this = this;
      var data = {
        labelName: _this.domain,
        name: _this.addNodeName
      };
      $.ajax({
        data: JSON.stringify(data),
        type: "POST",
        contentType: 'application/json',
        url: _this.contextRoot + "/restapi/v1/node/add",
        success: function(result) {
          if (result.code == 200) {
            d3.select(".graphcontainer").style("cursor", "");
            _this.addNodeName = '';
            _this.isRightAddNode = false;
            var newnode = result.data;
            newnode.r = 30;
            newnode.x = _this.txx;
            newnode.y = _this.tyy;
            newnode.fx = _this.txx;
            newnode.fy = _this.tyy;
            _this.graph.nodes.push(newnode);
            _this.updategraph();
            _this.$message({
              message: "添加成功",
              type: "success"
            });
          }else {
            _this.$message({
              message: "添加失败",
              type: "info"
            });
          }
        }
      });

    },
    //右键添加节点失败
    rightAddNodeCancel() {
      this.addNodeName = '';
      this.isRightAddNode = false;
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss">
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
.graph-search {
  display: flex;
}
.mind-l {
  width: 250px;
  float: left;
  background: #f7f9fc;
  height: 100%;
  border-right: 1px solid #d3e2ec;
}
.ml-ht {
  height: 50px;
  line-height: 50px;
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
  line-height: 50px;
  height: 50px;
  padding: 0 14px;
  border-bottom: 1px solid #ededed;
}
.mind-top .search {
  // width: 260px;
  margin-right: 8px;
}
.svg-a-sm {
  font-size: 14px;
  color: #156498;
  margin-right: 10px;
}
.mind-cen {
  height: calc(100% - 70px);
}
.sd {
  margin: 2px;
}
.sd-active {
  color: red !important;
}

text {
  cursor: pointer;
  max-width: 25px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}
circle {
  cursor: pointer;
}
#graphcontainerdiv {
  background: #f9fbfd;
}
.el-color-picker__panel {
  left: 812px !important;
}
.wange-toolbar {
  border: 1px solid #ccc;
}
.wangeditor-form {
  border: 1px solid #ccc;
  height: 350px;
  min-height: 340px;
}
.mind-fj-box {
  display: inline-block;
  width: 290px;
  padding: 5px;
  border: 1px solid #e6e6e6;
  box-shadow: 0 0 8px rgba(206, 205, 201, 0.38);
}
.mind-fj-p {
  color: #666;
  line-height: 24px;
  padding: 5px;
  background: rgba(255, 255, 255, 0.85);
}
.mind-carousel + .mind-fj-p .el-scrollbar__wrap {
  height: auto;
  max-height: 220px;
  min-height: 0;
}
.carous-img {
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  line-height: 197px;
  text-align: center;
}
.carous-img img {
  max-width: 100%;
  max-height: 100%;
  line-height: 197px;
  vertical-align: middle;
}
.circle_opreate {
  display: none;
}
.node_detail {
  position: absolute;
  width: 100%;
  line-height: 24px;
  padding: 8px;
  font-size: 12px;
  background: rgba(198, 226, 255, 0.2);
  display: none;
}
.node_pd {
  padding: 4px;
  font-size: 12px;
  font-family: -webkit-body;
  font-weight: 600;
}
.operatetips {
  position: absolute;
  right: 10px;
  float: right;
  top: 0;
  width: 220px;
  padding: 30px;
  border: 2px #ee7942 solid;
  border-radius: 4px;
}
.jsoncontainer {
  position: absolute;
  right: 30%;
  float: right;
  top: 0;
  width: 60%;
  height: 60%;
  padding: 30px;
  border: 2px #ee7942 solid;
  border-radius: 4px;
  background: #fff;
}
.cypher_toolbar {
  line-height: 70px;
  height: 85px;
  padding: 0 22px;
  border-bottom: 1px solid #ededed;
}
.color-represent {
  margin: 0;
  padding-left: 12px;
  line-height: 50px;
}
.color-represent-single {
  display: inline-block;
  line-height: 1em;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  user-select: none;
  font-size: 12px;
  margin-right: 5px;
  cursor: pointer;
  padding: 4px 7px 4px 9px;
  border-radius: 20px;
}
.user-attrs-item {
  width: 140px;
}
.user-attrs-span {
  margin-right: 15px;
}
.user-attrs {
  margin: 8px 0;
}
.user-attr-define {
  font-weight: 600;
  margin-bottom: 10px;
}
.user-attr-fixed {
  margin-bottom: 10px;
  font-size: 16px;
}
.user-attrs-del {
  margin-left: 8px;
  color: #409eff;
  cursor: pointer;
}
.search .search-select-first {
  width: 85px;
  margin-right: 5px;
}
.search .search-select-second {
  width: 120px;
  margin-right: 5px;
}
.search .input-with-select {
  width: 180px;
}
</style>
