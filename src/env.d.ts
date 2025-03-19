// env.d.ts
declare namespace App {
  interface Locals {
    email: string;
    name: string;
    avatar_url: string;
    userId: string;
    createdAt: string;
    school: string | undefined;
    phone: string | undefined;
    is_participant: boolean | undefined;
    is_visible: boolean | undefined;
  }
}