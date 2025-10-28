import { BaseDAO } from '../dao/base.dao.js';
import { Student } from '../models/student.model.js';

class StudentMongoDAO extends BaseDAO {
    constructor() {
        super(Student);
    }
}

export class StudentService {
    constructor(dao = new StudentMongoDAO()) {
        this.dao = dao;
    }

    async list() {
        return this.dao.getAll();
    }

    async getById(id) {
        return this.dao.getById(id);
    }

    async create(dto) {
        return this.dao.create(dto);
    }

    async update(id, dto) {
        return this.dao.updateById(id, dto);
    }

    async delete(id) {
        return !!(await this.dao.deleteById(id));
    }
}
