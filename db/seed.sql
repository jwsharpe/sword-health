DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS technicians;
DROP TABLE IF EXISTS managers;

CREATE TABLE IF NOT EXISTS managers (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS technicians (
    id INT NOT NULL AUTO_INCREMENT,
    managerId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (managerId) REFERENCES managers(id)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS tasks (
    id INT NOT NULL AUTO_INCREMENT,
    technicianId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    deletedDate TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (technicianId) REFERENCES technicians(id)
) ENGINE=INNODB;

INSERT INTO managers (name) VALUES
    ('John Doe'),
    ('Jane Smith'),
    ('Michael Johnson');

INSERT INTO technicians (managerId, name) VALUES
    (1, 'David Brown'),
    (1, 'Sarah Lee'),
    (2, 'Robert Wilson'),
    (3, 'Jennifer Davis');

INSERT INTO tasks (technicianId, title, summary) VALUES
    (1, 'Task 1', 'This is the summary for Task 1.'),
    (1, 'Task 2', 'This is the summary for Task 2.'),
    (2, 'Task 3', 'This is the summary for Task 3.'),
    (3, 'Task 4', 'This is the summary for Task 4.'),
    (3, 'Task 5', 'This is the summary for Task 5.'),
    (4, 'Task 6', 'This is the summary for Task 6.');