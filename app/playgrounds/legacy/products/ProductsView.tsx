"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { Product } from "@/types";

export default function ProductsView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");

  async function fetchProducts(search: string, category: string) {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (category) {
      params.set("category", category);
    }

    const query = params.toString();
    const response = await fetch(`/api/products${query ? `?${query}` : ""}`, {
      cache: "no-store",
    });
    const data = (await response.json()) as Product[];
    setProducts(data);
    setIsLoading(false);
  }

  useEffect(() => {
    const persistedCategory = window.sessionStorage.getItem("legacy-category-filter") ?? "";
    if (persistedCategory) {
      setCategoryValue(persistedCategory);
      // BUG LG-005: filter UI is restored on back-navigation, but results are fetched unfiltered.
    }
    void fetchProducts("", "");
  }, []);

  async function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchValue(searchInput);

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "PRODUCT_SEARCHED",
        metadata: { query: searchInput, category: categoryValue },
      }),
    });

    await fetchProducts(searchInput, categoryValue);
  }

  async function handleCategoryChange(nextCategory: string) {
    setCategoryValue(nextCategory);
    window.sessionStorage.setItem("legacy-category-filter", nextCategory);
    await fetchProducts(searchValue, nextCategory);
  }

  async function addToCart(productId: string) {
    await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
  }

  const categories = Array.from(new Set(products.map((product) => product.category)));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Legacy Products</h1>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products"
            className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
            data-testid="search-input"
          />
        </form>
        <select
          value={categoryValue}
          onChange={(event) => void handleCategoryChange(event.target.value)}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          data-testid="category-filter"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? <p className="text-zinc-400">Loading products...</p> : null}

      <div
        className="grid grid-cols-1 gap-4 min-[801px]:grid-cols-2 lg:grid-cols-3"
        data-testid="product-grid"
      >
        {/* BUG LG-009: grid remains single-column until 801px instead of 768px. */}
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4"
            data-testid="product-card"
          >
            <Link href={`/playgrounds/legacy/products/${product.id}`} className="block">
              {/* BUG LG-004: product image is missing meaningful alt text. */}
              <img
                src={product.imageUrl ?? ""}
                alt=""
                className="mb-3 h-40 w-full rounded-md object-cover bg-zinc-800"
                data-testid="product-image"
              />
              <h2 className="text-lg font-semibold text-white" data-testid="product-name">
                {product.name}
              </h2>
            </Link>
            <p className="text-zinc-400" data-testid="product-category">
              {product.category}
            </p>
            <p className="text-zinc-300" data-testid="product-rating">
              Rating: {product.rating.toFixed(1)}
            </p>
            <p className="mt-1 text-zinc-100" data-testid="product-price">
              ${product.price.toFixed(2)}
            </p>
            <p className="mb-3 text-xs text-zinc-500">{product.vendor}</p>
            {/* BUG LG-001: add buttons share duplicate text and no aria-label context. */}
            <button
              onClick={() => void addToCart(product.id)}
              className="rounded-md bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white"
              data-testid="add-to-cart-btn"
            >
              Add
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
