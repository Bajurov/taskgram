import { User, Project, Task, Access, Comment } from '../types';

export const users: User[] = [
  { id: '699759380', telegramId: '699759380', name: 'Владелец', role: 'owner' }
  // Остальные пользователи будут добавляться владельцем через интерфейс
];

export const projects: Project[] = [
  { id: 'p1', title: 'Клиент А', description: 'Описание клиента А', status: 'active' },
  { id: 'p2', title: 'Клиент Б', description: 'Описание клиента Б', status: 'archived' }
];

export const tasks: Task[] = [
  {
    id: 't1',
    title: 'Сделать сайт',
    description: 'Сделать сайт для клиента А',
    deadline: '2024-07-01',
    projectid: 'p1',
    creatorid: '699759380',
    assignees: [],
    status: 'new',
    comments: []
  },
  {
    id: 't2',
    title: 'Настроить рекламу',
    description: 'Настроить таргетированную рекламу для клиента А',
    deadline: '2024-07-15',
    projectid: 'p1',
    creatorid: '2',
    assignees: ['3'],
    status: 'in_progress',
    comments: [
      {
        id: 'c1',
        taskid: 't2',
        authorid: '3',
        text: 'Начал работу над рекламой',
        createdat: '2024-06-01'
      }
    ]
  }
];

export const accesses: Access[] = [
  {
    id: 'a1',
    projectId: 'p1',
    url: 'https://adminpanel.clienta.com',
    login: 'admin',
    password: 'password123',
    comment: 'Доступ к админ-панели клиента А'
  },
  {
    id: 'a2',
    projectId: 'p2',
    url: 'https://hosting.clientb.com',
    login: 'clientb',
    password: 'securepass',
    comment: 'Доступ к хостингу клиента Б'
  }
]; 