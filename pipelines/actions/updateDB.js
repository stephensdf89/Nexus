export default async function updateDB(input = {}, config = {}) {
  return {
    ok: true,
    table: config.table ?? null,
    operation: config.operation ?? "upsert",
    data: input,
  };
}
