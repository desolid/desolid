import Desolid from './Desolid';

(async function() {
    try {
        const desolid = new Desolid('./test');
        await desolid.start();
    } catch (error) {
        console.error(error);
    }
})();
