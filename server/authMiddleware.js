const supabase = require('./supabase');

async function authMiddleware(req, res, next) {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header is missing' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token is missing' });
        }

        //Validar sesion con Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        //Guardamos info usuario en la request para usar en las rutas
        req.user = user;
        next();
    }
    catch (err) {
        console.error('Authentication error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }

}

module.exports = authMiddleware;