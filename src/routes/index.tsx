import { createResource, createSignal, For, Show, type VoidComponent } from "solid-js";
import { Head, Title, Meta, Link } from "solid-start";
import { throttle } from "@solid-primitives/scheduled";
import axios from "axios";

const Home: VoidComponent = () => {
  const resultMap = new Map<string, FoodResults>();

  const [foodName, setFoodName] = createSignal<string>("")
  const trigger = throttle((brand: string) => setFoodName(brand), 300);

  function debouncedSetFoodName(value: string) {
    if (value.trim() === "") return;
    if (value.length < 6) return;

    trigger.clear();
    setTimeout(() => {
      trigger(value);
    }, 500);
  }

  const [data, { mutate, refetch }] = createResource(foodName, searchFood, {});
  const totalMatches = () => data.length;

  async function searchFood(brand: string): Promise<FoodResults | undefined> {
    const exists = resultMap.get(brand)
    if (exists) return exists
    console.log("searching for", brand)
    if (brand.trim() === "") return undefined;
    const { data } = await axios.get<FoodResults>(
      `https://tn.openfoodfacts.org/api/v2/search?brandTags=${brand}&sort_by=product_name`
    );
    resultMap.set(brand, data)
    console.log(data)
    if (data === null || data.products === null) {
      return undefined
    }
    return data;
  }
  return (
    <>
      <Head>
        <Title>CKhazna</Title>
        <Meta name="description" content="Generated by create-jd-app" />
        <Link rel="icon" href="/favicon.ico" />
      </Head>
      <main class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-pink-600 hover:gap-20">
        <div class="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 class="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">I like <span class="text-[hsl(88, 77%, 78%)]">MONEY</span> ❤️‍🔥
          </h1>
          <label for="foodName">Food Name</label>
          <input type="text" value={foodName()} onInput={(e) => debouncedSetFoodName(e.currentTarget.value)} />
          <button onClick={() => refetch()}>Refresh</button>
          <div>
            Matches : {totalMatches()}
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Show when={!data.loading} fallback={<>Searching...</>}>
              <div class="grid grid-flow-row group-[products] grid-cols-2 hover:gap-70">
                <For each={data()?.products}>
                  {(food) => {
                    return (
                      <div class="hover:gap-20">
                        {
                          food.image_url && <img src={food.image_url} />
                        }
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;


interface FoodResults {
  products: Food[];
  count: number;
  page_count: number;
  page_size: number;
  skip: number;
}

interface Food {
  _id: string;
  _keywords: string[];
  _score: number;
  _source: string;
  _type: string;
  image_url?: string;
  code: string;
}