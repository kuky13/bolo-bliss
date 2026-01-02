-- Permitir que apenas admins deletem pedidos
create policy "Admins can delete orders"
  on public.orders
  for delete
  using (has_role('admin'::app_role));