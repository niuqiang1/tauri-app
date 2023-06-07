<template>
  <div>
    <q-layout class="shadow-2 rounded-borders">
      <q-header elevated>
        <q-toolbar>
          <!-- <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar> -->

          <q-toolbar-title>可视化工具</q-toolbar-title>

          <q-btn flat round dense icon="whatshot" />
        </q-toolbar>
      </q-header>

      <q-page-container>
        <q-page class="q-pa-md">
          <upload></upload>
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import upload from "./components/Upload.vue";
</script>
