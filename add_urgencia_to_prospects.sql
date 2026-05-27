-- Migration: Add 'urgencia' field to prospects table para seguimiento de Leads

ALTER TABLE public.prospects
ADD COLUMN IF NOT EXISTS urgencia text DEFAULT 'Solo explorando';
