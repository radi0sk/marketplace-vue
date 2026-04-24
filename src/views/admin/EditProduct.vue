<script setup lang="ts">
import { useRoute } from 'vue-router';
import ProductForm from '@/components/admin/ProductForm.vue';

const route = useRoute();
const productId = route.params.id as string;
</script>

<template>
  <div class="min-h-full py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Breadcrumbs / Back -->
      <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol role="list" class="flex items-center space-x-4">
          <li>
            <div>
              <router-link to="/admin" class="text-gray-400 hover:text-gray-500">
                <svg class="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span class="sr-only">Dashboard</span>
              </router-link>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <router-link to="/admin/products" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">Productos</router-link>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <span class="ml-4 text-sm font-medium text-gray-700">Editar Producto</span>
            </div>
          </li>
        </ol>
      </nav>

      <div class="premium-card p-0 overflow-hidden">
        <ProductForm :is-edit="true" :id="productId" />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>