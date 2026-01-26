import app from '@/app';
import Config from '@/config';

const PORT = Config.env.port;

app.listen(PORT, (): void => {
    console.log(`Server is running on port ${PORT}`);
});