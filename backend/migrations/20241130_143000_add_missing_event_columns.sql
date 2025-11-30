-- Migration: Add missing columns to events table
-- This migration adds columns that may be missing from existing events table

-- Add description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'description'
    ) THEN
        ALTER TABLE events ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add sport_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'sport_type'
    ) THEN
        ALTER TABLE events ADD COLUMN sport_type VARCHAR(50);
    END IF;
END $$;

-- Add cover_image column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'cover_image'
    ) THEN
        ALTER TABLE events ADD COLUMN cover_image VARCHAR(500);
    END IF;
END $$;

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'status'
    ) THEN
        ALTER TABLE events ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
    END IF;
END $$;

-- Add organizer_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'organizer_id'
    ) THEN
        ALTER TABLE events ADD COLUMN organizer_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE events ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

