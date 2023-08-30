import {ref} from "vue";

type Notification = {
  content: string;
  expire: number;
  leave?: boolean;
}

export const notifications = ref<Notification[]>([]);

export function notify(content: string, expire: number = 5000): void {
  if (!notifications.value) notifications.value = [];
  notifications.value.push({content, expire: (new Date()).getTime() + expire});
}

setInterval(() => {
  if (!notifications.value) return;
  const now = (new Date()).getTime();
  // leave animation: 0.5s
  notifications.value = notifications.value.filter((notification) => {
    if (notification.expire < now) {
      notification.leave = true;
    }
    return notification.expire > now - 500;
  });
}, 800);
