"use client";

import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAppStore } from "@/lib/store";
import { Moon, Sun, Upload, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  GROUP_LABELS,
  NAV_GROUPS,
  VIEW_LIST,
  viewHref,
  type NavGroup,
} from "@/lib/views";
import { viewIcons } from "@/lib/view-icons";

const actions = [
  { id: "upload", label: "上传简历", icon: Upload, desc: "拖拽上传 PDF / DOCX / MD" },
  { id: "optimize", label: "AI 一键优化简历", icon: Zap, desc: "使用 AI 优化当前简历" },
  { id: "agent-run", label: "启动 AI Job Agent", icon: Zap, desc: "自动化整个求职流程" },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useAppStore();
  const { setTheme } = useTheme();
  const router = useRouter();

  const go = (id: (typeof VIEW_LIST)[number]["id"]) => {
    setCommandOpen(false);
    router.push(viewHref(id));
  };

  const handleAction = (id: string) => {
    setCommandOpen(false);
    if (id === "upload") {
      go("resume");
      toast.success("请拖拽文件到简历管理页面");
      return;
    }
    if (id === "optimize") {
      toast.success("正在优化简历...");
      go("resume");
      return;
    }
    if (id === "agent-run") go("agent");
  };

  const itemsByGroup = (group: NavGroup) => VIEW_LIST.filter((v) => v.group === group);

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="输入命令、搜索页面、或执行 AI 操作..." />
      <CommandList>
        <CommandEmpty>没有找到结果</CommandEmpty>

        <CommandGroup heading="快速操作">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.id}
                onSelect={() => handleAction(action.id)}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span>{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.desc}</span>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        {NAV_GROUPS.map((group) => (
          <CommandGroup key={group} heading={GROUP_LABELS[group]}>
            {itemsByGroup(group).map((cmd) => {
              const Icon = viewIcons[cmd.id];
              return (
                <CommandItem
                  key={cmd.id}
                  onSelect={() => go(cmd.id)}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{cmd.label}</span>
                  {cmd.shortcut && (
                    <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}

        <CommandSeparator />

        <CommandGroup heading="主题">
          <CommandItem onSelect={() => { setTheme("dark"); setCommandOpen(false); }}>
            <Moon className="h-4 w-4" />
            <span>切换到深色模式</span>
          </CommandItem>
          <CommandItem onSelect={() => { setTheme("light"); setCommandOpen(false); }}>
            <Sun className="h-4 w-4" />
            <span>切换到浅色模式</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
