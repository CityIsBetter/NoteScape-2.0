'use client'
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, LucideIcon, MoreHorizontal, Plus, Trash } from "lucide-react"
import { Skeleton } from "../ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import { startTransition } from "react";
import { archiveNote, createNewNote } from "@/actions/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ItemProps {
  id?: string;
  documentIcon?:string
  active?:boolean
  expanded?:boolean
  isSearch?:boolean
  level?:number
  onExpand?:() => void
  label?:string
  onClick:() => void
  icon:LucideIcon
}

export function Item ({id,label,onClick,icon:Icon,active,documentIcon,isSearch,level=0,onExpand,expanded}:ItemProps) {

  const ChevronIcon = expanded ? ChevronDown : ChevronRight

  const { user } = useUser();
  const router = useRouter();

  const handleExpand = (event:React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    onExpand?.()
  }

  const handleCreateNewNote = () => {
    try {
      startTransition(async() => {
        const {noteId} = await createNewNote(id);
        if (!expanded) {
          onExpand?.()
        }
        router.push(`/notes/${noteId}`);
      })
      toast.success("New note created");
    } catch (error) {
      toast.error("failed to create a new note");
    }
  }

  function handleArchive(id: string) {
    try {
      startTransition(async() => {
        const {success} = await archiveNote(id);
        if(success) toast.success("Note Deleted Successfully");
      })
    } catch (error) {
      toast.error("failed to create a new note");
    }
  }

return (
    <div className={cn(`group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5
    flex items-center text-muted-foreground font-medium`,
    active && 'bg-primary/5 text-primary')}
     onClick={onClick} role="button" style={{paddingLeft:level ? `${(level * 12) + 12}px` :'12px'}}>
      {!!id && (
        <div className="h-full rounded-sm hover:bg-neutral-300 dark:bg-neutral-600 mr-1" onClick={handleExpand} role="button">
          <ChevronIcon className="w-4 h-4 shrink-0 text-muted-foreground/50"/>
        </div>
      )}
      {documentIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">
          {documentIcon}
        </div>
      ) :
      <Icon className="shrink-0 h-[18px] mr-2 text-muted-foreground"/>
      }
      <span className="truncate">
        {label}
      </span>
      {isSearch && (
        <kbd className="ml-auto pointer-events-none inline-flex gap-1 items-center h-5 select-none rounded border
        bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">alt</span>K
        </kbd>
      )}

      {!!id && (
        <div className="ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <div className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm
              hover:bg-neutral-300 dark:hover:bg-neutral-600" role="button">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground"/>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="start" side="right" forceMount>
              <DropdownMenuItem onClick={() => {handleArchive(id)}} className="cursor-pointer">
                <Trash className="w-4 h-4 mr-2"/>
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator/>
              <div className="text-xs text-muted-foreground p-2">
                Last edited by: {user?.fullName}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
          role="button" onClick={handleCreateNewNote}>
            <Plus className="w-4 h-4 text-muted-foreground"/>
          </div>
        </div>
      )}
    </div>
)
}

Item.Skeleton = function ItemSkeleton({level}:{level?:number}) {
  return (
    <div className="flex gap-x-2 py-[3px]" style={{paddingLeft:level ? `${(level * 12) + 25}px`: '12px'}}>
      <Skeleton className="w-4 h-4"/>
      <Skeleton className="w-4 h-[30%]"/>
    </div>
  )
}