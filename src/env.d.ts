// src/env.d.ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    email: string;
    name: string; // Add name
    avatar_url: string; // Add avatar_url
  }
}