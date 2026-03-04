import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendVerificationEmail } from '../services/emailService.js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface VerificationRecord {
  email: string;
  name: string;
  password: string;
  expires: number;
}

const VERIFICATION_TOKENS = new Map<string, VerificationRecord>();

router.post('/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    try {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = Date.now() + 24 * 60 * 60 * 1000;
      
      VERIFICATION_TOKENS.set(token, { email, name, password, expires });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const verificationUrl = `${frontendUrl}/verify?token=${token}`;

      const result = await sendVerificationEmail(email, name, verificationUrl);
      
      if (!result.success) {
        return res.status(500).json({ error: 'Failed to send verification email' });
      }

      res.status(200).json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (error: any) {
      console.error('Signup error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post('/verify',
  body('token').notEmpty(),
  async (req: Request, res: Response) => {
    const { token } = req.body;

    const stored = VERIFICATION_TOKENS.get(token);
    if (!stored) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    if (Date.now() > stored.expires) {
      VERIFICATION_TOKENS.delete(token);
      return res.status(400).json({ error: 'Token expired' });
    }

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: stored.email,
        email_confirm: true,
        user_metadata: { name: stored.name }
      });

      if (error) throw error;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: stored.email,
        password: stored.password,
      });

      if (signInError) {
        console.error('Auto sign-in failed:', signInError);
      }

      VERIFICATION_TOKENS.delete(token);

      res.status(200).json({ message: 'Email verified successfully', user: data.user });
    } catch (error: any) {
      console.error('Verification error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return res.status(401).json({ error: error.message });
      }

      res.status(200).json({ 
        message: 'Login successful', 
        session: data.session,
        user: data.user 
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
