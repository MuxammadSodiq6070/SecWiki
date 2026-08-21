type CommandWithCounts = {
  id: number
  parameters: string | null
  _count?: { powers: number; comments: number }
}

export function serializeCommand(command: CommandWithCounts, poweredCommandIds = new Set<number>()) {
  let parameters: unknown[] = []
  try {
    if (command.parameters) parameters = JSON.parse(command.parameters)
  } catch {
    parameters = []
  }

  return {
    ...command,
    parameters,
    powerCount: command._count?.powers || 0,
    commentCount: command._count?.comments || 0,
    powered: poweredCommandIds.has(command.id)
  }
}

export function commandIdFromParams(id: string) {
  const commandId = Number(id)
  return Number.isInteger(commandId) && commandId > 0 ? commandId : null
}
