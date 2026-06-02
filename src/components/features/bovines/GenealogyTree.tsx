import type { Bovine } from "../../../db/db";

interface GenealogyNode {
  bovine: Bovine | null;
  mom: GenealogyNode | null;
  dad: GenealogyNode | null;
}

interface GenealogyTreeProps {
  tree: GenealogyNode | null;
  onBovineClick?: (id: number) => void;
}

function NodeCard({
  bovine,
  label,
  depth,
  onBovineClick,
}: {
  bovine: Bovine | null;
  label: string;
  depth: number;
  onBovineClick?: (id: number) => void;
}) {
  if (!bovine) {
    return (
      <div className="bg-neutral-50 dark:bg-neutral-800/50 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg p-2 text-center min-w-[80px]">
        <div className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-xs text-neutral-300 dark:text-neutral-600 mt-0.5">
          Desconhecido
        </div>
      </div>
    );
  }

  const isMale = bovine.gender === "MACHO";
  const sizeClasses = depth === 0 ? "p-3 min-w-[120px]" : "p-2 min-w-[80px]";
  const textSize = depth === 0 ? "text-sm" : "text-xs";

  return (
    <button
      onClick={() => bovine.id && onBovineClick?.(bovine.id)}
      className={`
        ${sizeClasses}
        rounded-lg border text-left transition-all hover:shadow-md active:scale-95
        ${
          isMale
            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
            : "bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800"
        }
      `}
    >
      <div className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        {label}
      </div>
      <div
        className={`${textSize} font-semibold truncate ${
          isMale
            ? "text-blue-700 dark:text-blue-300"
            : "text-pink-700 dark:text-pink-300"
        }`}
      >
        {bovine.name}
      </div>
      {depth === 0 && bovine.breed && (
        <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          {bovine.breed}
        </div>
      )}
    </button>
  );
}

function TreeLevel({
  node,
  label,
  depth,
  onBovineClick,
}: {
  node: GenealogyNode | null;
  label: string;
  depth: number;
  onBovineClick?: (id: number) => void;
}) {
  if (!node || depth > 3) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <NodeCard
        bovine={node.bovine}
        label={label}
        depth={depth}
        onBovineClick={onBovineClick}
      />
      {(node.mom || node.dad) && (
        <div className="flex gap-2 mt-1">
          <TreeLevel
            node={node.mom}
            label="Mãe"
            depth={depth + 1}
            onBovineClick={onBovineClick}
          />
          <TreeLevel
            node={node.dad}
            label="Pai"
            depth={depth + 1}
            onBovineClick={onBovineClick}
          />
        </div>
      )}
    </div>
  );
}

export function GenealogyTree({ tree, onBovineClick }: GenealogyTreeProps) {
  if (!tree) {
    return (
      <div className="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm">
        Sem dados genealógicos.
      </div>
    );
  }

  const hasMomOrDad = tree.mom || tree.dad;

  if (!hasMomOrDad) {
    return (
      <div className="text-center py-8 text-neutral-400 dark:text-neutral-500 text-sm">
        Mãe e pai não registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex flex-col items-center gap-2 min-w-fit">
        {/* The root animal */}
        <NodeCard
          bovine={tree.bovine}
          label="Animal"
          depth={0}
          onBovineClick={onBovineClick}
        />

        {/* Connector line */}
        <div className="w-px h-3 bg-neutral-300 dark:bg-neutral-600" />

        {/* Parents level */}
        <div className="flex gap-4">
          {/* Mother branch */}
          <div className="flex flex-col items-center">
            <TreeLevel
              node={tree.mom}
              label="Mãe"
              depth={1}
              onBovineClick={onBovineClick}
            />
          </div>

          {/* Father branch */}
          <div className="flex flex-col items-center">
            <TreeLevel
              node={tree.dad}
              label="Pai"
              depth={1}
              onBovineClick={onBovineClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
