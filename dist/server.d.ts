interface McpEditor {
    get(name: string): unknown;
    set(name: string, config: {
        type: "remote";
        url: string;
    }): void;
}
interface SkillEditor {
    get(id: string): unknown;
    add(skill: {
        id: string;
        name: string;
        description?: string;
        path: string;
        content: string;
    }): void;
}
interface Transformable<Editor> {
    transform(callback: (editor: Editor) => void): Promise<unknown>;
}
interface Context {
    mcp: Transformable<McpEditor>;
    skill: Transformable<SkillEditor>;
}
declare const _default: {
    id: string;
    setup: (ctx: Context) => Promise<void>;
};
export default _default;
