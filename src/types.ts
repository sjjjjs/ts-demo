export interface Role {
    id: string
    name: string
    avatarUrl?: string
}
export interface Dialogue {
    id: string | number
    text: string
    roleId: string
    refDialogueId?: string | number
    atRoleId?: string
    done?: boolean
    lite?: boolean
}

export interface SpanInfo {
    value: string;
    type: string;
    [key: string]: any;
}

export interface SrtItem {
    id: string;
    startTime: string;
    startSeconds: number;
    endTime: string;
    endSeconds: number;
    text: string;
}

export interface SrtItemPlus extends SrtItem {
    props: { [key: string]: string }
}

export interface ParsedSrtText {
    value: string
    props: {
        [key: string]: string
    }
}

export interface SrtGroup {
    id: string
    name: string
    description: string
    ids: string[]
    ids2: { id: string, done: boolean }[]
}
export interface SrtGroup2 {
    id: string
    name: string
    description: string
    items: SrtItemPlus[][]
}

export type PropMap = Record<string, { [key: string]: string }>
