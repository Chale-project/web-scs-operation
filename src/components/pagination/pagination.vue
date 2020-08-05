<template>
  <div class="pagination">
    <a-pagination
      showQuickJumper
      hideOnSinglePage
      showSizeChanger
      v-model="currentPage"
      :pageSizeOptions="pageSizeOptions"
      :pageSize="pageSize"
      :total="total"
      @change="change"
      @showSizeChange="change"
    >
      <template slot="buildOptionText" slot-scope='props'>
        <span>{{ props.value }}条/页</span>
      </template>
    </a-pagination>
    <span class="record">共{{ total }}条记录&nbsp;第{{ current }}/{{ totalPage }}页</span>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  // props: ['current', 'pageSizeOptions', 'pageSize', 'total', 'totalPage'],
  props: {
    current: {
      type: Number,
      required: true
    },
    pageSizeOptions: {
      type: Array,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    totalPage: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      currentPage: 1
    }
  },
  watch: {
    'current': function (current) {
      this.currentPage = current
    }
  },
  methods: {
    change (currentPage, pageSize) {
      // console.log(page,pageSize)
      this.$emit('change', {
        currentPage,
        pageSize
      })
    },
  }
}
</script>

<style scoped>
  .pagination {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-top: 32px;
  }
  .record {
    color: #ccc;
    position: absolute;
    bottom: 30px;
    left: 25px
  }
</style>
