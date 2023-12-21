<template>
  <div class="announcement">
    <div class="description">
      {{announcement.from}} told {{announcement.to}}: {{announcement.message}} 
    </div>
  </div>
</template>

<script>
export default{
  name: "Announcement",
  props: {
    announcement: Object,
  }
}
</script>

<style scoped>
.selected {
  background-color: #1164a3;
}

.announcement {
  padding: 10px;
}

.description {
  display: inline-block;
}


</style>
