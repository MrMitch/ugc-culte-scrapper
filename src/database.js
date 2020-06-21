import fs from 'fs';

export default {
    path: null,
    read (path) {
        let existingJson;
        this.path = path;

        try {
            existingJson = fs.readFileSync(path);
        } catch (e) {
            existingJson = "[]";
        }

        return JSON.parse(existingJson);
    },

    save (database) {
        fs.writeFileSync(this.path, JSON.stringify(database));
    }
}
