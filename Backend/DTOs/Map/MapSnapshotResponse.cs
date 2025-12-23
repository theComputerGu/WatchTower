namespace Backend.DTOs.Map;

public class MapSnapshotResponse
{
    public List<MapAreaDto> Areas { get; set; } = [];
    public List<MapDeviceDto> Devices { get; set; } = [];
    public List<MapTargetDto> Targets { get; set; } = [];
    public MapStatsDto Stats { get; set; } = null!;
}
