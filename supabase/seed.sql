insert into public.products (
  name, name_es, slug, description, description_es, category, category_es,
  price_ars, stock_quantity, low_stock_threshold, status, featured,
  main_image_url, variations
) values
('Camiseta Democracia', 'Remera Democracia', 'camiseta-democracia', 'Camiseta vermelha em algodão.', 'Remera roja de algodón.', 'camisetas', 'remeras', 18000, 14, 5, 'disponivel', true, 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80', array['P','M','G','GG']),
('Boné Brasil Popular', 'Gorra Brasil Popular', 'bone-brasil-popular', 'Boné bordado.', 'Gorra bordada.', 'acessorios', 'accesorios', 12000, 4, 5, 'poucas_unidades', true, 'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80', array['Vermelho','Branco'])
on conflict (slug) do nothing;
