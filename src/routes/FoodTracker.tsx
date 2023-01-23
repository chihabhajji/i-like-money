import { useQueryClient } from "@tanstack/solid-query";
import { createResource, createSignal } from "solid-js";
import { For } from "solid-js";

export default function FoodTracker() {
    const [foodName, setFoodName] = createSignal<string>("")

    function debouncedSetFoodName(value: string) {
        setTimeout(() => {
            setFoodName(value);
        }, 500);
    }

    const [data, { mutate, refetch }] = createResource(foodName, searchFood);

    const totalMatches = () => data.length;
    return (
        <div>
            <div>
                <form>
                    <label for="foodName">Food Name</label>
                    <input type="text" value={foodName()} onInput={(e) => setFoodName(e.currentTarget.value)} />
                </form>
            </div>
            <div>
                <For each={data()}>
                    {(food) => {
                        return (
                            <li>
                                <div>aaa</div>
                            </li>
                        );
                    }}
                </For>
            </div>
        </div>
    );
}


async function searchFood(query: string): Promise<unknown[]> {
    if (query.trim() === "") return [];
    const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURI(query)}`
    );
    const results = await response.json();
    return results.docs.slice(0, 10).map(({ title, author_name }) => ({
        title,
        author: author_name?.join(", "),
    }));
}