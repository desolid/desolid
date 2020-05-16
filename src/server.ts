import {Desolid} from './Desolid';

async function main() {
    // try {
    const desolid = new Desolid('./test');
    await desolid.start();
    // } catch (error) {
    //     console.log(error);
    //     throw error;
    // }
};

main();
