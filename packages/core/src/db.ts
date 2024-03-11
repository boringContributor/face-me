import { Entity, EntityItem, Service } from 'electrodb'
import { ddb } from './aws-clients'
import { Table } from 'sst/node/table'

export const Connection = new Entity({
    model: {
        entity: 'Connection',
        version: '1',
        service: 'core',
    },
    attributes: {
        connection_id: {
            required: true,
            type: 'string'
        },
        status: {
            type: ['available', 'pending', 'unavailable'] as const,
            validate(val: string) {
                if (!['available', 'pending', 'unavailable'].includes(val)) {
                    throw new Error('Status must be one of "available", "pending", or "unavailable"')
                }
            },
        },
        created_at: {
            type: 'string',
            default: () => new Date().toISOString()
        },
        peer_id: {
            type: 'string',
            required: false
        },
        user_id: {
            type: 'string',
            required: false
        },
        connected_to: {
            type: 'string',
            required: false
        
        }
    },
    indexes: {
        by_connection_id: {
            pk: {
                field: "pk",
                composite: ["connection_id"],
            },
            sk: {
                field: "sk",
                composite: []
            }
        },
        by_status: {
            index: 'gsi1pk-gsi1sk-index',
            pk: {
                field: "gsi1pk",
                composite: ["status"],
            },
            sk: {
                field: "gsi1sk",
                composite: ["created_at"],
            }
        }
    }
}, {
    client: ddb,
    table: Table.Connections.tableName
})


export const ConnectionService = new Service(
  {
    connection: Connection,
  },
  { table:  Table.Connections.tableName, 
    client: ddb },
);

export type Connection = EntityItem<typeof Connection>;