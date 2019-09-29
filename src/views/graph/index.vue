<template>
  <div class="graph-container">
    this is graph
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'graph',
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  }
}
</script>
