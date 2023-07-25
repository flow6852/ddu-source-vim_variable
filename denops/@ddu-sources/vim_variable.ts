import {
  BaseSource,
  Context,
  Item,
  SourceOptions,
} from "https://deno.land/x/ddu_vim@v3.4.3/types.ts";
import { Denops, fn, vars } from "https://deno.land/x/ddu_vim@v3.4.3/deps.ts";
import { assert, is } from "https://deno.land/x/unknownutil@v3.4.0/mod.ts";

type Params = {
  bufnr: number;
};

export class Source extends BaseSource<Params> {
  override kind = "vim_type";

  override gather(args: {
    denops: Denops;
    sourceOptions: SourceOptions;
    sourceParams: Params;
    context: Context;
  }): ReadableStream<Item[]> {
    return new ReadableStream<Item[]>({
      async start(controller) {
        let bufnr = args.sourceParams.bufnr;
        if (bufnr < 1) {
          bufnr = args.context.bufNr;
        }
        controller.enqueue(
          await getVariables(args.denops, args.sourceParams.bufnr),
        );
        controller.close();
      },
    });
  }

  override params(): Params {
    return {
      bufnr: 0,
    };
  }
}

async function getVariables(denops: Denops, bufnr: number) {
  const items: Item[] = [];
  // buffer variables
  const bufVars = await fn.getbufvar(
    denops,
    bufnr,
    "",
  );
  assert(bufVars, is.String);
  for (
    const [name, value] of Object.entries(bufVars)
  ) {
    items.push({
      word: "b:" + name,
      action: {
        value: value,
        type: "var",
        scope: "b",
      },
    });
  }
  // global variables
  const globalVarItems = await fn.getcompletion(
    denops,
    "g:",
    "var",
  );
  assert(globalVarItems, is.ArrayOf(is.String));

  for (
    const item of globalVarItems
  ) {
    const src = await vars.globals.get(
      denops,
      item.split(":")[1],
    );
    items.push({
      word: item,
      action: {
        value: src,
        type: "var",
        scope: "g",
      },
    });
  }

  // window variables
  const windowVarItems = await fn.getcompletion(
    denops,
    "w:",
    "var",
  );
  assert(windowVarItems, is.ArrayOf(is.String));
  for (
    const item of windowVarItems
  ) {
    const value = await fn.getwinvar(
      denops,
      await fn.win_getid(denops),
      item.split(":")[1],
    );
    items.push({
      word: item,
      action: {
        value: value,
        type: "var",
        scope: "w",
      },
    });
  }

  // tab variables
  const tabVarItems = await fn.getcompletion(
    denops,
    "t:",
    "var",
  );
  assert(tabVarItems, is.ArrayOf(is.String));
  for (
    const item of tabVarItems
  ) {
    const value = await fn.gettabvar(
      denops,
      await fn.tabpagenr(denops),
      item.split(":")[1],
    );
    items.push({
      word: item,
      action: {
        value: value,
        type: "var",
        scope: "t",
      },
    });
  }

  return items;
}
