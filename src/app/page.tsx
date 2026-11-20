import { redirect } from "next/navigation";
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (value !== undefined)
      for (const item of [value].flat()) params.append(key, item);
  }
  redirect(`/payments${params.size ? `?${params}` : ""}`);
}
