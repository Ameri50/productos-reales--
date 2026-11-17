import { HashRouter, Link, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { AboutPage } from "@/pages/AboutPage";
import { LoginPage, RegisterPage } from "@/pages/AuthPages";
import { CartPage } from "@/pages/CartPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { HomePage } from "@/pages/HomePage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ShopPage } from "@/pages/ShopPage";
import { SupportPage } from "@/pages/SupportPage";

function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
        Error 404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Esta página no existe
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Puede que el enlace haya cambiado o el producto ya no esté disponible.
      </p>
      <Link
        to="/"
        className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="tienda" element={<ShopPage />} />
                <Route path="producto/:id" element={<ProductDetailPage />} />
                <Route path="carrito" element={<CartPage />} />
                <Route path="historial" element={<HistoryPage />} />
                <Route path="perfil" element={<ProfilePage />} />
                <Route path="soporte" element={<SupportPage />} />
                <Route path="nosotros" element={<AboutPage />} />
                <Route path="ingresar" element={<LoginPage />} />
                <Route path="registro" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </HashRouter>
  );
}
